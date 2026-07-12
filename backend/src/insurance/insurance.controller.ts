import { Controller, Post, Patch, Get, Body, Param, UseGuards } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { PreAuthStatus } from '../entities/insurance-pre-auth.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private insuranceService: InsuranceService) {}

  @Roles(Role.RECEPTIONIST)
  @Post('request')
  async createRequest(@Body() body: { appointmentId: string; insuranceCompany: string; treatmentCode: string }) {
    return this.insuranceService.createRequest(body.appointmentId, body.insuranceCompany, body.treatmentCode);
  }

  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: PreAuthStatus; notes?: string }) {
    return this.insuranceService.updateStatus(id, body.status, body.notes);
  }

  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @Get()
  async getAllRequests() {
    return this.insuranceService.getAllRequests();
  }
}
