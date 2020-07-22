import { MigrationInterface, QueryRunner } from "typeorm";
import { DocumentStatus } from "src/document/document.config";

export class Status1594501297638 implements MigrationInterface {
    name = 'Status1594501297638'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_95ff138b88fdd8a7c9ebdb97a32" UNIQUE ("name"), CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`, undefined);

        // Default values
        let values = [
            `('${DocumentStatus.CLOSED}')`,
            `('${DocumentStatus.ONLY_CAPTURE}')`,
            `('${DocumentStatus.ONLY_EDITION}')`,
            `('${DocumentStatus.OPEN}')`
        ]

        await queryRunner.query(`INSERT INTO "status" (name) VALUES ${values}`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "status"`, undefined);
    }

}
