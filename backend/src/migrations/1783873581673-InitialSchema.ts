import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783873581673 implements MigrationInterface {
    name = 'InitialSchema1783873581673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subjective" text, "objective" text, "assessment" text, "plan" text, "attachmentUrl" character varying, "isFinalized" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" uuid, "doctorId" uuid, CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "specialty" character varying NOT NULL, "licenseNumber" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_a798afca9436b00dac80f911a8" UNIQUE ("userId"), CONSTRAINT "PK_b07c128005f6a0d0135d6e7353b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show', 'waitlist')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled', "cancellationWaitlistAlertTime" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" uuid, "doctorId" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."insurance_pre_auths_status_enum" AS ENUM('pending', 'approved', 'denied')`);
        await queryRunner.query(`CREATE TABLE "insurance_pre_auths" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "treatmentCode" character varying NOT NULL, "status" "public"."insurance_pre_auths_status_enum" NOT NULL DEFAULT 'pending', "insuranceCompany" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" uuid, CONSTRAINT "PK_a02dcdb3434ae6662e962944576" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "dateOfBirth" date, "insuranceId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_fc4788002ae2de0a68f6ccf24e" UNIQUE ("userId"), CONSTRAINT "PK_7297a6976f065cc75e798674aa8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'doctor', 'receptionist', 'patient')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'patient', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD CONSTRAINT "FK_a798afca9436b00dac80f911a83" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" ADD CONSTRAINT "FK_212848640d7cbdfba81d5ea26c7" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD CONSTRAINT "FK_fc4788002ae2de0a68f6ccf24e5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP CONSTRAINT "FK_fc4788002ae2de0a68f6ccf24e5"`);
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" DROP CONSTRAINT "FK_212848640d7cbdfba81d5ea26c7"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_0c1af27b469cb8dca420c160d65"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP CONSTRAINT "FK_a798afca9436b00dac80f911a83"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patient_profiles"`);
        await queryRunner.query(`DROP TABLE "insurance_pre_auths"`);
        await queryRunner.query(`DROP TYPE "public"."insurance_pre_auths_status_enum"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "doctor_profiles"`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
    }

}
