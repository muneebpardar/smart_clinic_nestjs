import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { PatientProfile } from './entities/patient-profile.entity';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { Appointment } from './entities/appointment.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { InsurancePreAuth } from './entities/insurance-pre-auth.entity';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        PatientProfile,
        DoctorProfile,
        Appointment,
        MedicalRecord,
        InsurancePreAuth,
      ],
      synchronize: false, // We use migrations
    }),
    AuthModule,
    AppointmentsModule,
    MedicalRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
