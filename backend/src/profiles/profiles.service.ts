import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from '../entities/patient-profile.entity';
import { DoctorProfile } from '../entities/doctor-profile.entity';
import { User, Role } from '../entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(PatientProfile)
    private patientRepo: Repository<PatientProfile>,
    @InjectRepository(DoctorProfile)
    private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getPatientProfile(userId: string) {
    const profile = await this.patientRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Patient profile not found');
    return profile;
  }

  async getDoctorProfile(userId: string) {
    const profile = await this.doctorRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }

  async getAllDoctors() {
    return await this.doctorRepo.find({ relations: { user: true } });
  }

  async updatePatientProfile(userId: string, data: Partial<PatientProfile>) {
    let profile = await this.patientRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      profile = this.patientRepo.create({ user: user as User, ...data });
    } else {
      Object.assign(profile, data);
    }
    return await this.patientRepo.save(profile);
  }
}
