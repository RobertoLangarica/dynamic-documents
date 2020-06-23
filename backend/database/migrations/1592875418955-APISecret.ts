import {MigrationInterface, QueryRunner} from "typeorm";

export class APISecret1592875418955 implements MigrationInterface {
    name = 'APISecret1592875418955'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "secrets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "active" boolean NOT NULL, "secret" character varying NOT NULL, "user_id" uuid NOT NULL, "ip" inet, CONSTRAINT "PK_d4ff48ddba1883d4dc142b9c697" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "secrets" ADD CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "secrets" DROP CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0"`, undefined);
        await queryRunner.query(`DROP TABLE "secrets"`, undefined);
    }

}
