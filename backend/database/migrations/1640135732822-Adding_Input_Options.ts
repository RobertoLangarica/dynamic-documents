import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingInputOptions1640135732822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // input type
        let r = '('
            r += `'Opciones'`
            r += `,'Campo para selección de opción multiple'`
            r += `,'input-options'`
            r += `,'${JSON.stringify({})}'`
            r += `,'1. Captura'`
            r += `,'7'`
            r += `)`

        await queryRunner.query(`INSERT INTO "field_types" ("name", "description", "component", "parameters", "category", "order") VALUES ${r}`)
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "field_types" WHERE component=$1`,['input-options'])
    }

}
