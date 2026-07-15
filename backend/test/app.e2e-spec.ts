import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../src/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/entities/appointment.entity';
import { MedicalRecord } from '../src/entities/medical-record.entity';
import { InsurancePreAuth } from '../src/entities/insurance-pre-auth.entity';
import { PatientProfile } from '../src/entities/patient-profile.entity';
import { DoctorProfile } from '../src/entities/doctor-profile.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Mock TypeORM globally in tests so it doesn't try to connect to the actual PostgreSQL database
jest.mock('@nestjs/typeorm', () => {
  const original = jest.requireActual('@nestjs/typeorm');
  const { DataSource } = jest.requireActual('typeorm');
  const { Global, Module } = jest.requireActual('@nestjs/common');

  @Global()
  @Module({
    providers: [
      {
        provide: DataSource,
        useValue: {
          transaction: jest.fn(),
          getRepository: jest.fn(),
        },
      },
    ],
    exports: [DataSource],
  })
  class FakeRootModule {}

  return {
    ...original,
    TypeOrmModule: {
      forRoot: () => ({
        module: FakeRootModule,
      }),
      forFeature: (entities: any[]) => {
        const providers = entities.map(entity => ({
          provide: original.getRepositoryToken(entity),
          useValue: {},
        }));
        return {
          module: class FakeFeatureModule {},
          providers,
          exports: providers.map(p => p.provide),
        };
      },
    },
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const supertest = (request.default || request) as any;

  let tempUser: any = null;
  const mockUsersRepository = {
    findOne: jest.fn().mockImplementation(async (options) => {
      if (tempUser && options?.where?.email === tempUser.email) {
        return tempUser;
      }
      return null;
    }),
    create: jest.fn().mockImplementation((data) => {
      tempUser = { id: '1', ...data };
      return tempUser;
    }),
    save: jest.fn().mockImplementation(async (user) => {
      tempUser = user;
      return user;
    }),
  };

  const mockAppointmentsRepository = {
    findOne: jest.fn().mockResolvedValue({ id: '1', status: AppointmentStatus.SCHEDULED, startTime: new Date(), doctor: { id: '2' }, patient: { id: '3' } }),
    save: jest.fn(),
  };

  const mockProfilesRepository = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation(async (profile) => profile),
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
      .overrideProvider(getRepositoryToken(PatientProfile))
      .useValue(mockProfilesRepository)
      .overrideProvider(getRepositoryToken(DoctorProfile))
      .useValue(mockProfilesRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return supertest(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password', role: Role.PATIENT })
      .expect(201);
  });

  it('/auth/login (POST)', () => {
    return supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);
  });

  it('/appointments/book (POST) without auth should fail', () => {
    return supertest(app.getHttpServer())
      .post('/appointments/book')
      .send({ doctorId: 'doc', patientId: 'pat', startTime: new Date().toISOString(), endTime: new Date().toISOString() })
      .expect(401);
  });
});
