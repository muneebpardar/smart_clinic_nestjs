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
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { EventsModule } from './events/events.module';
import { ProfilesModule } from './profiles/profiles.module';
import { InsuranceModule } from './insurance/insurance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate: (config: Record<string, any>) => {
        const apiKey = config.GEMINI_API_KEY;
        if (apiKey && !/^(AIza|AQ\.).+/.test(apiKey)) {
          throw new Error('Config validation error: GEMINI_API_KEY must start with "AIza" or "AQ."');
        }
        return config;
      }
    }),
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
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    AppointmentsModule,
    MedicalRecordsModule,
    AiProxyModule,
    EventsModule,
    ProfilesModule,
    InsuranceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
