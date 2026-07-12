import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';

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

  @Roles(Role.DOCTOR)
  @Post('upload-lab-result')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadLabResult(
    @Request() req: any,
    @Body('appointmentId') appointmentId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })], // 5 MB limit
      }),
    )
    file: Express.Multer.File,
  ) {
    return { 
      message: 'File uploaded successfully', 
      filename: file.originalname,
      size: file.size,
      appointmentId 
    };
  }
}
