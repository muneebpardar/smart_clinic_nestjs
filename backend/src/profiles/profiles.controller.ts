import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Roles(Role.PATIENT, Role.RECEPTIONIST, Role.ADMIN)
  @Get('patient/me')
  async getMyPatientProfile(@Request() req: any) {
    return this.profilesService.getPatientProfile(req.user.userId);
  }

  @Roles(Role.PATIENT)
  @Put('patient/me')
  async updateMyPatientProfile(@Request() req: any, @Body() data: any) {
    return this.profilesService.updatePatientProfile(req.user.userId, data);
  }

  @Roles(Role.DOCTOR, Role.RECEPTIONIST, Role.ADMIN)
  @Get('doctor/me')
  async getMyDoctorProfile(@Request() req: any) {
    return this.profilesService.getDoctorProfile(req.user.userId);
  }

  @Roles(Role.PATIENT, Role.RECEPTIONIST, Role.ADMIN)
  @Get('doctors')
  async getAllDoctors() {
    return this.profilesService.getAllDoctors();
  }
}
