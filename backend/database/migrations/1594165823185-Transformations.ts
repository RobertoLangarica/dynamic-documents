import { MigrationInterface, QueryRunner } from "typeorm";

export class Transformations1594165823185 implements MigrationInterface {
    name = 'Transformations1594165823185'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transformations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_6bd2549fa224ce4e8a8d0dc3f37" UNIQUE ("name"), CONSTRAINT "PK_64d8104dbdd72b30b53702035dd" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "transformations"`, undefined);
    }

}
