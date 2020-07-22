import {MigrationInterface, QueryRunner} from "typeorm";

export class DocumentFilter1594596924685 implements MigrationInterface {
    name = 'DocumentFilter1594596924685'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "document_filters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "name" character varying NOT NULL, "document" uuid NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE DEFAULT null, "description" character varying NOT NULL DEFAULT '', "owner" uuid NOT NULL, "fields" jsonb NOT NULL DEFAULT '[]', "expired" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_cb03530e40af55f0cb914f423d2" UNIQUE ("name"), CONSTRAINT "PK_f8690412c1a7402084048e3f700" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "document_filters"`, undefined);
    }

}
