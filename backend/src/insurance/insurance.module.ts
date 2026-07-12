import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { InsurancePreAuth } from '../entities/insurance-pre-auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InsurancePreAuth])],
  providers: [InsuranceService],
  controllers: [InsuranceController],
  exports: [InsuranceService],
})
export class InsuranceModule {}
