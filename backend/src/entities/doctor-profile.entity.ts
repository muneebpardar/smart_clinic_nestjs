import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { MedicalRecord } from './medical-record.entity';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @OneToOne(() => User, user => user.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => MedicalRecord, record => record.doctor)
  medicalRecords: MedicalRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
