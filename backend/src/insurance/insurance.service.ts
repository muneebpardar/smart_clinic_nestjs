import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsurancePreAuth, PreAuthStatus } from '../entities/insurance-pre-auth.entity';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsurancePreAuth)
    private insuranceRepo: Repository<InsurancePreAuth>,
  ) {}

  async createRequest(appointmentId: string, insuranceCompany: string, treatmentCode: string) {
    const request = this.insuranceRepo.create({
      appointment: { id: appointmentId } as any,
      insuranceCompany,
      treatmentCode,
      status: PreAuthStatus.PENDING,
    });
    return await this.insuranceRepo.save(request);
  }

  async updateStatus(id: string, status: PreAuthStatus, notes?: string) {
    const request = await this.insuranceRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Pre-auth request not found');

    request.status = status;
    // Note: The entity lacks a 'notes' field natively; if needed, we can log it elsewhere
    
    return await this.insuranceRepo.save(request);
  }

  async getAllRequests() {
    return await this.insuranceRepo.find({ relations: { appointment: { patient: true } } });
  }
}
