import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { MedicalRecord } from './medical-record.entity';
import { InsurancePreAuth } from './insurance-pre-auth.entity';

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  insuranceId: string;

  @OneToOne(() => User, user => user.patientProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => MedicalRecord, record => record.patient)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => InsurancePreAuth, preAuth => preAuth.patient)
  insurancePreAuths: InsurancePreAuth[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
