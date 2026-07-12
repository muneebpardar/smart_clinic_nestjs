import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';
import { DoctorProfile } from './doctor-profile.entity';

export enum Role {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => PatientProfile, profile => profile.user, { nullable: true })
  patientProfile: PatientProfile;

  @OneToOne(() => DoctorProfile, profile => profile.user, { nullable: true })
  doctorProfile: DoctorProfile;
}
