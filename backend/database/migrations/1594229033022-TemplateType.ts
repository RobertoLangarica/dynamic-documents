import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplateType1594229033022 implements MigrationInterface {
    name = 'TemplateType1594229033022'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "template_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_83377adb45f108f5a9597e0ff0e" UNIQUE ("name"), CONSTRAINT "PK_0ccf022fbca4b459d510d152dcc" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "template_types"`, undefined);
    }

}
