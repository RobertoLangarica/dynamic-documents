import {MigrationInterface, QueryRunner} from "typeorm";

export class Validations1594002968431 implements MigrationInterface {
    name = 'Validations1594002968431'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "validations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "regex" character varying NOT NULL, "error_message" character varying NOT NULL, CONSTRAINT "UQ_f2d56f6642c79b45ac37dbace09" UNIQUE ("name"), CONSTRAINT "PK_d523bd8c24ea354126be8cff546" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "validations"`, undefined);
    }

}
