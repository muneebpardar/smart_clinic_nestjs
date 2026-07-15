import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities/user.entity';
import { PatientProfile } from '../entities/patient-profile.entity';
import { DoctorProfile } from '../entities/doctor-profile.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,
    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(data: any) {
    const existing = await this.usersRepository.findOne({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
    });
    await this.usersRepository.save(user);

    if (data.role === Role.PATIENT) {
      const patient = this.patientRepository.create({
        user: { id: user.id } as User,
        firstName: data.firstName || 'New',
        lastName: data.lastName || 'Patient',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      });
      await this.patientRepository.save(patient);
    } else if (data.role === Role.DOCTOR) {
      const doctor = this.doctorRepository.create({
        user: { id: user.id } as User,
        firstName: data.firstName || 'New',
        lastName: data.lastName || 'Doctor',
        specialty: data.specialty || 'General Practice',
        licenseNumber: data.licenseNumber || 'LIC-UNKNOWN',
      });
      await this.doctorRepository.save(doctor);
    }

    return this.login(user);
  }
}
