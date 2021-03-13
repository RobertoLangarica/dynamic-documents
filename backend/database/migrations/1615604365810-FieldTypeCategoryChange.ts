import {MigrationInterface, QueryRunner} from "typeorm";

export class FieldTypeCategoryChange1615604365810 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE field_types SET category='3. Utilerías' WHERE name='Párrafo' OR name='Grupo'`)
        await queryRunner.query(`DELETE FROM field_types WHERE name='Texto libre'`)
        await queryRunner.query(`UPDATE field_types SET category='2. Captura' WHERE name='Texto'`)
        await queryRunner.query(`UPDATE field_types SET category='1. Captura' WHERE category='2. Captura'`)
        await queryRunner.query(`UPDATE field_types SET category='2. Utilerías' WHERE category='3. Utilerías'`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
