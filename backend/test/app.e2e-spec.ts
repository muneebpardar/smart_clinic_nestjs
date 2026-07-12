import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../src/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/entities/appointment.entity';
import { MedicalRecord } from '../src/entities/medical-record.entity';
import { InsurancePreAuth } from '../src/entities/insurance-pre-auth.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockUsersRepository = {
    findOne: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', role: Role.PATIENT }),
    create: jest.fn().mockReturnValue({ id: '1', email: 'test@test.com', role: Role.PATIENT }),
    save: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockAppointmentsRepository = {
    findOne: jest.fn().mockResolvedValue({ id: '1', status: AppointmentStatus.SCHEDULED, startTime: new Date(), doctor: { id: '2' }, patient: { id: '3' } }),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (cb) => {
      const manager = {
        createQueryBuilder: jest.fn().mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        }),
        create: jest.fn().mockReturnValue({ id: 'app1' }),
        save: jest.fn().mockResolvedValue({ id: 'app1' }),
      };
      return cb(manager);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(Appointment))
      .useValue(mockAppointmentsRepository)
      .overrideProvider(getRepositoryToken(MedicalRecord))
      .useValue({})
      .overrideProvider(getRepositoryToken(InsurancePreAuth))
      .useValue({})
      // Mocking bcrypt globally is tricky, but the auth service uses it.
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password', role: Role.PATIENT })
      .expect(201);
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);
  });

  it('/appointments/book (POST) without auth should fail', () => {
    return request(app.getHttpServer())
      .post('/appointments/book')
      .send({ doctorId: 'doc', patientId: 'pat', startTime: new Date().toISOString(), endTime: new Date().toISOString() })
      .expect(401);
  });
});
