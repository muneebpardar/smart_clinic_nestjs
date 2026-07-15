import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Roles(Role.RECEPTIONIST)
  @Post('walk-in')
  async handleWalkIn(@Body() body: { doctorId: string; patientId: string }) {
    return this.appointmentsService.handleWalkIn(body.doctorId, body.patientId);
  }

  @Roles(Role.PATIENT, Role.RECEPTIONIST)
  @Post('book')
  async book(@Body() body: { doctorId: string; patientId: string; startTime: string; endTime: string }) {
    return this.appointmentsService.bookAppointment(
      body.doctorId,
      body.patientId,
      new Date(body.startTime),
      new Date(body.endTime)
    );
  }

  @Roles(Role.PATIENT, Role.RECEPTIONIST, Role.DOCTOR)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }

  @Roles(Role.PATIENT)
  @Get('patient/me')
  async getMyPatientAppointments(@Request() req: any) {
    return this.appointmentsService.getPatientAppointments(req.user.userId);
  }

  @Roles(Role.DOCTOR)
  @Get('doctor/me')
  async getMyDoctorAppointments(@Request() req: any) {
    return this.appointmentsService.getDoctorAppointments(req.user.userId);
  }

  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @Get('analytics')
  async getAnalytics() {
    return this.appointmentsService.getAnalytics();
  }

  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @Get()
  async getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  @Roles(Role.PATIENT)
  @Post(':id/intake-summary')
  async saveIntakeSummary(@Param('id') id: string, @Body() body: { triageSummary: any }) {
    return this.appointmentsService.saveIntakeSummary(id, body.triageSummary);
  }
}
