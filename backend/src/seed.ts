import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, Role } from './entities/user.entity';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { PatientProfile } from './entities/patient-profile.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const userRepo = dataSource.getRepository(User);
  const docRepo = dataSource.getRepository(DoctorProfile);
  const patientRepo = dataSource.getRepository(PatientProfile);

  console.log('Seeding database...');
  
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const adminExists = await userRepo.findOne({ where: { email: 'admin@smartclinic.com' } });
  if (!adminExists) {
    await userRepo.save({ email: 'admin@smartclinic.com', passwordHash: defaultPassword, role: Role.ADMIN });
  }

  // 2. Create Receptionist
  const recExists = await userRepo.findOne({ where: { email: 'reception@smartclinic.com' } });
  if (!recExists) {
    await userRepo.save({ email: 'reception@smartclinic.com', passwordHash: defaultPassword, role: Role.RECEPTIONIST });
  }

  // 3. Create Doctors
  const docs = [
    { email: 'dr.smith@smartclinic.com', firstName: 'John', lastName: 'Smith', specialty: 'Cardiology' },
    { email: 'dr.jones@smartclinic.com', firstName: 'Sarah', lastName: 'Jones', specialty: 'Dermatology' },
    { email: 'dr.lee@smartclinic.com', firstName: 'Michael', lastName: 'Lee', specialty: 'General Practice' },
  ];

  for (const doc of docs) {
    let docUser = await userRepo.findOne({ where: { email: doc.email } });
    if (!docUser) {
      docUser = await userRepo.save({ email: doc.email, passwordHash: defaultPassword, role: Role.DOCTOR });
      await docRepo.save({
        user: docUser,
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialty: doc.specialty,
        licenseNumber: `LIC-${Math.floor(Math.random() * 100000)}`,
      });
    }
  }

  // 4. Create Patients
  const patients = [
    { email: 'patient1@demo.com', firstName: 'Alice', lastName: 'Walker', phone: '555-0101' },
    { email: 'patient2@demo.com', firstName: 'Bob', lastName: 'Ray', phone: '555-0102' },
  ];

  for (const pat of patients) {
    let patUser = await userRepo.findOne({ where: { email: pat.email } });
    if (!patUser) {
      patUser = await userRepo.save({ email: pat.email, passwordHash: defaultPassword, role: Role.PATIENT });
      await patientRepo.save({
        user: patUser,
        firstName: pat.firstName,
        lastName: pat.lastName,
        dateOfBirth: new Date('1990-01-01'),
        insuranceId: `INS-${Math.floor(Math.random() * 100000)}`,
      });
    }
  }

  console.log('Database seeded successfully.');
  await app.close();
}

bootstrap();
