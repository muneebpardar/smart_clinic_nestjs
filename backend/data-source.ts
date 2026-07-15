import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { PatientProfile } from './src/entities/patient-profile.entity';
import { DoctorProfile } from './src/entities/doctor-profile.entity';
import { Appointment } from './src/entities/appointment.entity';
import { MedicalRecord } from './src/entities/medical-record.entity';
import { InsurancePreAuth } from './src/entities/insurance-pre-auth.entity';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Using database URL:', process.env.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [
    User,
    PatientProfile,
    DoctorProfile,
    Appointment,
    MedicalRecord,
    InsurancePreAuth,
  ],
  migrations: ['./src/migrations/*.ts'],
  subscribers: [],
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});
