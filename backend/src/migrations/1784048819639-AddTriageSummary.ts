import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTriageSummary1784048819639 implements MigrationInterface {
    name = 'AddTriageSummary1784048819639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "appointmentId" uuid`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "triageSummary" jsonb`);
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" ADD "appointmentId" uuid`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_31bef5f9acc117db52116ee09be" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" ADD CONSTRAINT "FK_959b4cdadd67cc22809f591cc1e" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" DROP CONSTRAINT "FK_959b4cdadd67cc22809f591cc1e"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_31bef5f9acc117db52116ee09be"`);
        await queryRunner.query(`ALTER TABLE "insurance_pre_auths" DROP COLUMN "appointmentId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "triageSummary"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "appointmentId"`);
    }

}
