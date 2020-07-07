import {MigrationInterface, QueryRunner} from "typeorm";

export class Transformation1594156693762 implements MigrationInterface {
    name = 'Transformation1594156693762'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transformations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_6bd2549fa224ce4e8a8d0dc3f37" UNIQUE ("name"), CONSTRAINT "PK_64d8104dbdd72b30b53702035dd" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "transformations_field_types" ("transformation_id" uuid NOT NULL, "field_type_id" uuid NOT NULL, CONSTRAINT "PK_115c59d0dad5756c1506c7ff4ea" PRIMARY KEY ("transformation_id", "field_type_id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_8ed617b35af7bec79d9c06c9de" ON "transformations_field_types" ("transformation_id") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_36cf36b56ae1c533cab4ca37d9" ON "transformations_field_types" ("field_type_id") `, undefined);
        await queryRunner.query(`ALTER TABLE "transformations_field_types" ADD CONSTRAINT "FK_8ed617b35af7bec79d9c06c9de4" FOREIGN KEY ("transformation_id") REFERENCES "transformations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "transformations_field_types" ADD CONSTRAINT "FK_36cf36b56ae1c533cab4ca37d9e" FOREIGN KEY ("field_type_id") REFERENCES "field_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transformations_field_types" DROP CONSTRAINT "FK_36cf36b56ae1c533cab4ca37d9e"`, undefined);
        await queryRunner.query(`ALTER TABLE "transformations_field_types" DROP CONSTRAINT "FK_8ed617b35af7bec79d9c06c9de4"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_36cf36b56ae1c533cab4ca37d9"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_8ed617b35af7bec79d9c06c9de"`, undefined);
        await queryRunner.query(`DROP TABLE "transformations_field_types"`, undefined);
        await queryRunner.query(`DROP TABLE "transformations"`, undefined);
    }

}
