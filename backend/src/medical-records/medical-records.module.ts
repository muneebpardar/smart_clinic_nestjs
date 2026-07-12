import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from '../entities/medical-record.entity';
import { InsurancePreAuth } from '../entities/insurance-pre-auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, InsurancePreAuth])],
  providers: [MedicalRecordsService],
  controllers: [MedicalRecordsController],
})
export class MedicalRecordsModule {}
