import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplateDocsDropUnique1606257058987 implements MigrationInterface {
    name = 'TemplateDocsDropUnique1606257058987'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT "UQ_5624219dd33b4644599d4d4b231"`, undefined);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "UQ_f5aa827a6a4f1f29940278412fb"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "UQ_f5aa827a6a4f1f29940278412fb" UNIQUE ("name")`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD CONSTRAINT "UQ_5624219dd33b4644599d4d4b231" UNIQUE ("name")`, undefined);
    }
}
