import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment } from './appointment.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  subjective: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'text', nullable: true })
  assessment: string;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @ManyToOne(() => PatientProfile, patient => patient.medicalRecords, { onDelete: 'CASCADE' })
  patient: PatientProfile;

  @ManyToOne(() => DoctorProfile, doctor => doctor.medicalRecords, { onDelete: 'CASCADE' })
  doctor: DoctorProfile;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  appointment: Appointment;

  @Column({ default: false })
  isFinalized: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
