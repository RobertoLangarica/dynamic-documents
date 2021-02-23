import {MigrationInterface, QueryRunner} from "typeorm";

export class Fillmaps1614036452987 implements MigrationInterface {
    name = 'Fillmaps1614036452987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fillmaps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "source_type" character varying NOT NULL, "destination_type_id" uuid NOT NULL, "fields" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_6866f343924c713417b31085a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6bade48b0810c0e31dff371fb2" ON "fillmaps" ("source_type", "destination_type_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6bade48b0810c0e31dff371fb2"`);
        await queryRunner.query(`DROP TABLE "fillmaps"`);
    }

}
