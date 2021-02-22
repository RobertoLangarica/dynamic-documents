import {MigrationInterface, QueryRunner} from "typeorm";

export class UnifyingIDsNames1614031144023 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "typeId" TO "type_id"`)
        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "statusId" TO "status_id"`)
        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "document_source" TO "source_id"`)
        
        await queryRunner.query(`ALTER TABLE document_filters RENAME COLUMN "document" TO "document_id"`)
        await queryRunner.query(`ALTER TABLE document_filters RENAME COLUMN "owner" TO "owner_id"`)
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE document_filters RENAME COLUMN "owner_id" TO "owner"`)
        await queryRunner.query(`ALTER TABLE document_filters RENAME COLUMN "document_id" TO "document"`)

        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "source_id" TO "document_source"`)
        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "status_id" TO "statusId"`)
        await queryRunner.query(`ALTER TABLE documents RENAME COLUMN "type_id" TO "typeId"`)
    }

}
