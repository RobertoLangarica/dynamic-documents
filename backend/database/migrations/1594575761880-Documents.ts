import {MigrationInterface, QueryRunner} from "typeorm";

export class Documents1594575761880 implements MigrationInterface {
    name = 'Documents1594575761880'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "fields" jsonb NOT NULL DEFAULT '[]', "template_source" uuid, "document_source" uuid, "versions" jsonb NOT NULL DEFAULT '[]', "computed_capture" character varying, "computed_print" character varying, "typeId" uuid, "statusId" uuid, CONSTRAINT "UQ_f5aa827a6a4f1f29940278412fb" UNIQUE ("name"), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "documents_categories" ("document_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_12eb2c76381b2e220d752e69b77" PRIMARY KEY ("document_id", "category_id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_db943c652b46a3f7196efaa685" ON "documents_categories" ("document_id") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_643bcc4c38dcad2ecb2b8df7f9" ON "documents_categories" ("category_id") `, undefined);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_3bf44c640a449515b3dff330786" FOREIGN KEY ("typeId") REFERENCES "template_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_20b6dde1724ca8f732903a7d465" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "documents_categories" ADD CONSTRAINT "FK_db943c652b46a3f7196efaa6859" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "documents_categories" ADD CONSTRAINT "FK_643bcc4c38dcad2ecb2b8df7f91" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "documents_categories" DROP CONSTRAINT "FK_643bcc4c38dcad2ecb2b8df7f91"`, undefined);
        await queryRunner.query(`ALTER TABLE "documents_categories" DROP CONSTRAINT "FK_db943c652b46a3f7196efaa6859"`, undefined);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_20b6dde1724ca8f732903a7d465"`, undefined);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_3bf44c640a449515b3dff330786"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_643bcc4c38dcad2ecb2b8df7f9"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_db943c652b46a3f7196efaa685"`, undefined);
        await queryRunner.query(`DROP TABLE "documents_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "documents"`, undefined);
    }

}
