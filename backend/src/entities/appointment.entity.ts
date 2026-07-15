import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';
import { DoctorProfile } from './doctor-profile.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  WAITLIST = 'waitlist',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @ManyToOne(() => PatientProfile, patient => patient.appointments, { onDelete: 'CASCADE' })
  patient: PatientProfile;

  @ManyToOne(() => DoctorProfile, doctor => doctor.appointments, { onDelete: 'CASCADE' })
  doctor: DoctorProfile;

  @Column({ nullable: true })
  cancellationWaitlistAlertTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  triageSummary: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
