import { DocumentStatus } from "src/document/document.config";
import {MigrationInterface, QueryRunner} from "typeorm";

export class StatusPreventChanges1610741171152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        // Adding new status
        await queryRunner.query(`INSERT INTO "status" (name) VALUES ($1)`,[DocumentStatus.PREVENT_CHANGES])
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "status" WHERE name=$1`,[DocumentStatus.PREVENT_CHANGES])
    }

}
