import {MigrationInterface, QueryRunner} from "typeorm";

export class FillmapsAutofill1622939415552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE fillmaps SET autofill=TRUE`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Ther is no way to know which maps where autofill 
    }

}
