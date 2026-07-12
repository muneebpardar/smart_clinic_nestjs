import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('MedicalRecords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Roles(Role.DOCTOR)
  @Post('save')
  async saveRecord(@Request() req: any, @Body() body: any) {
    return this.medicalRecordsService.saveRecord(
      req.user.userId, // JWT sub
      body.appointmentId,
      {
        subjective: body.subjective,
        objective: body.objective,
        assessment: body.assessment,
        plan: body.plan,
      },
      body.finalize
    );
  }
}
