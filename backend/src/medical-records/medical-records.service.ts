import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { InsurancePreAuth, PreAuthStatus } from '../entities/insurance-pre-auth.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    @InjectRepository(InsurancePreAuth)
    private preAuthRepository: Repository<InsurancePreAuth>
  ) {}

  async saveRecord(doctorId: string, appointmentId: string, data: Partial<MedicalRecord>, finalize: boolean) {
    const preAuth = await this.preAuthRepository.findOne({ where: { appointment: { id: appointmentId } } });
    
    // Hard Rule: block doctor from completing/saving if insurance is not approved
    if (!preAuth || preAuth.status !== PreAuthStatus.APPROVED) {
      throw new BadRequestException('Cannot save medical record: Insurance Pre-Authorisation is not approved.');
    }

    let record = await this.medicalRecordsRepository.findOne({
      where: { appointment: { id: appointmentId }, doctor: { id: doctorId } },
    });

    if (!record) {
      record = this.medicalRecordsRepository.create({
        appointment: { id: appointmentId },
        doctor: { id: doctorId },
        ...data,
        isFinalized: finalize,
      });
    } else {
      if (record.isFinalized) {
        throw new BadRequestException('Medical record is already finalized.');
      }
      Object.assign(record, data);
      record.isFinalized = finalize;
    }

    return await this.medicalRecordsRepository.save(record);
  }
}
