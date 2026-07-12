import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';
import { Appointment } from './appointment.entity';

export enum PreAuthStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
}

@Entity('insurance_pre_auths')
export class InsurancePreAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treatmentCode: string;

  @Column({ type: 'enum', enum: PreAuthStatus, default: PreAuthStatus.PENDING })
  status: PreAuthStatus;

  @Column({ nullable: true })
  insuranceCompany: string;

  @ManyToOne(() => PatientProfile, patient => patient.insurancePreAuths, { onDelete: 'CASCADE' })
  patient: PatientProfile;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  appointment: Appointment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
