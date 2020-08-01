import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRelationsCascade1595720017844 implements MigrationInterface {
    name = 'UserRelationsCascade1595720017844'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`, undefined);

        await queryRunner.query(`ALTER TABLE "grants" DROP CONSTRAINT "FK_501eb48e321a0f302707ec42aa3"`, undefined);
        await queryRunner.query(`ALTER TABLE "grants" ADD CONSTRAINT "FK_501eb48e321a0f302707ec42aa3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);

        await queryRunner.query(`ALTER TABLE "secrets" DROP CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0"`, undefined);
        await queryRunner.query(`ALTER TABLE "secrets" ADD CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`, undefined);

        await queryRunner.query(`ALTER TABLE "grants" DROP CONSTRAINT "FK_501eb48e321a0f302707ec42aa3"`, undefined);
        await queryRunner.query(`ALTER TABLE "grants" ADD CONSTRAINT "FK_501eb48e321a0f302707ec42aa3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);

        await queryRunner.query(`ALTER TABLE "secrets" DROP CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0"`, undefined);
        await queryRunner.query(`ALTER TABLE "secrets" ADD CONSTRAINT "FK_106f4ab977e36a2b20aed1c8ce0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
