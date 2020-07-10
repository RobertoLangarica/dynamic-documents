import {MigrationInterface, QueryRunner} from "typeorm";

export class Templates1594356865534 implements MigrationInterface {
    name = 'Templates1594356865534'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "fields" jsonb NOT NULL DEFAULT '[]', "typeId" uuid, CONSTRAINT "UQ_5624219dd33b4644599d4d4b231" UNIQUE ("name"), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "templates_categories" ("template_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_36f9b5dbfc1599dd482d66b00e1" PRIMARY KEY ("template_id", "category_id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_11477a94c85b7440289c8374de" ON "templates_categories" ("template_id") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_d36f3fd62e02d867e8c0eeab0d" ON "templates_categories" ("category_id") `, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD CONSTRAINT "FK_d62e11538cacbc5318d0385142c" FOREIGN KEY ("typeId") REFERENCES "template_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "templates_categories" ADD CONSTRAINT "FK_11477a94c85b7440289c8374dea" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "templates_categories" ADD CONSTRAINT "FK_d36f3fd62e02d867e8c0eeab0de" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "templates_categories" DROP CONSTRAINT "FK_d36f3fd62e02d867e8c0eeab0de"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates_categories" DROP CONSTRAINT "FK_11477a94c85b7440289c8374dea"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT "FK_d62e11538cacbc5318d0385142c"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_d36f3fd62e02d867e8c0eeab0d"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_11477a94c85b7440289c8374de"`, undefined);
        await queryRunner.query(`DROP TABLE "templates_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "templates"`, undefined);
    }

}
