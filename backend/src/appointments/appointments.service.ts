import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private dataSource: DataSource
  ) {}

  async bookAppointment(doctorId: string, patientId: string, startTime: Date, endTime: Date) {
    return await this.dataSource.transaction(async (manager) => {
      // Pessimistic write lock to prevent double booking
      const conflictingAppointments = await manager
        .createQueryBuilder(Appointment, 'appointment')
        .setLock('pessimistic_write')
        .where('appointment.doctorId = :doctorId', { doctorId })
        .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
        .andWhere(
          '(appointment.startTime < :endTime AND appointment.endTime > :startTime)',
          { startTime, endTime }
        )
        .getMany();

      if (conflictingAppointments.length > 0) {
        throw new BadRequestException('Doctor is already booked for this time slot');
      }

      const appointment = manager.create(Appointment, {
        doctor: { id: doctorId },
        patient: { id: patientId },
        startTime,
        endTime,
        status: AppointmentStatus.SCHEDULED,
      });

      return await manager.save(appointment);
    });
  }

  async cancelAppointment(appointmentId: string) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) throw new BadRequestException('Appointment not found');

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentsRepository.save(appointment);

    // Waitlist Alert System
    const timeDifference = appointment.startTime.getTime() - new Date().getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference <= 2 && hoursDifference > 0) {
      // Find next patient on waitlist
      const waitlisted = await this.appointmentsRepository.findOne({
        where: {
          doctor: { id: appointment.doctor.id },
          status: AppointmentStatus.WAITLIST,
        },
        order: { createdAt: 'ASC' },
      });

      if (waitlisted) {
        // Trigger alert logic (in a real app, send WebSocket event or Email)
        waitlisted.cancellationWaitlistAlertTime = new Date();
        await this.appointmentsRepository.save(waitlisted);
        console.log(`Alert sent to waitlisted patient ${waitlisted.patient?.id}`);
      }
    }
    return appointment;
  }
}
