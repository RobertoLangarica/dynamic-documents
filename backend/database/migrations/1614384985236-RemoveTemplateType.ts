import {MigrationInterface, QueryRunner} from "typeorm";
import { TemplateType1594229033022 } from "./1594229033022-TemplateType";

export class RemoveTemplateType1614384985236 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_3bf44c640a449515b3dff330786"`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "type_id" TO "type"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "type" TYPE character varying`);
        await queryRunner.query(`UPDATE "documents" SET type = source_id WHERE type IS NULL AND source_id IS NOT NULL`);

        await queryRunner.query(`ALTER TABLE fillmaps RENAME COLUMN "destination_type_id" TO "destination_type"`)
        await queryRunner.query(`ALTER TABLE fillmaps ALTER COLUMN "destination_type" DROP DEFAULT`)
        await queryRunner.query(`ALTER TABLE fillmaps ALTER COLUMN "destination_type" TYPE character varying`)

        let templateMigration = new TemplateType1594229033022()
        await templateMigration.down(queryRunner)

    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        
        let templateMigration = new TemplateType1594229033022()
        await templateMigration.up(queryRunner)
        
        await queryRunner.query(`ALTER TABLE fillmaps ALTER COLUMN "destination_type" SET DEFAULT uuid_generate_v4()`)
        await queryRunner.query(`ALTER TABLE fillmaps ALTER COLUMN "destination_type" TYPE uuid USING destination_type::uuid`)
        await queryRunner.query(`ALTER TABLE fillmaps RENAME COLUMN "destination_type" TO "destination_type_id"`)        
        
        await queryRunner.query(`UPDATE "documents" SET type = NULL`) // there is some missing info here but there is no types to recover
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "type" TO "type_id"`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_3bf44c640a449515b3dff330786" FOREIGN KEY ("type_id") REFERENCES "template_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
    }

}
