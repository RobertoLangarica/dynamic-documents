import {MigrationInterface, QueryRunner} from "typeorm";

export class DocFilterDropUnique1611876122299 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "document_filters" DROP CONSTRAINT "UQ_cb03530e40af55f0cb914f423d2"`)
    }
    
    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "document_filters" ADD CONSTRAINT "UQ_cb03530e40af55f0cb914f423d2"  UNIQUE ("name")`)
    }

}
