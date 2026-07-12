import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
}
