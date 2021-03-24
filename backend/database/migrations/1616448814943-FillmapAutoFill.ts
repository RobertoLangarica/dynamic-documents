import {MigrationInterface, QueryRunner} from "typeorm";

export class FillmapAutoFill1616448814943 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE fillmaps ADD COLUMN autofill BOOLEAN DEFAULT FALSE`)
        await queryRunner.query(`ALTER TABLE fillmaps ADD COLUMN name character varying`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE fillmaps DROP COLUMN autofill`)
        await queryRunner.query(`ALTER TABLE fillmaps DROP COLUMN name`)
    }

}
