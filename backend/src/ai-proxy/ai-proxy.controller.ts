import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Proxy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-proxy')
export class AiProxyController {
  constructor(private aiProxyService: AiProxyService) {}

  @Roles(Role.PATIENT, Role.RECEPTIONIST)
  @Post('intake')
  async processIntake(@Body('chatHistory') chatHistory: string[]) {
    return this.aiProxyService.processPatientIntake(chatHistory);
  }

  @Roles(Role.DOCTOR, Role.RECEPTIONIST)
  @Post('recommendation')
  async recommend(@Body('intakeData') intakeData: any) {
    return this.aiProxyService.recommendNextSteps(intakeData);
  }

  @Roles(Role.DOCTOR)
  @Post('format-soap')
  async formatSoap(@Body('rawNotes') rawNotes: string) {
    return this.aiProxyService.formatSoapNote(rawNotes);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post('predict-no-show')
  async predictNoShow(@Body('patientData') patientData: any) {
    return this.aiProxyService.predictNoShowRisk(patientData);
  }
}
