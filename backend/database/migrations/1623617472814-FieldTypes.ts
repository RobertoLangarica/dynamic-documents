import {MigrationInterface, QueryRunner} from "typeorm";

export class FieldTypes1623617472814 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM field_types`)
        await queryRunner.query(`
            INSERT INTO "public"."field_types"("name","description","component","parameters","category","order")
            VALUES
            (E'Grupo',E'Campo que contiene a otros campos',E'group',E'{}',E'2. Utilerías',6),
            (E'Entero',E'Un número entero',E'input-integer',E'{"pattern": "0,0"}',E'1. Captura',0),
            (E'Moneda',E'Una cantidad con el formato $000.00',E'input-currency',E'{"prefix": "$", "pattern": "0,0.00"}',E'1. Captura',3),
            (E'Porcentaje',E'Un número decimal con el postfijo %',E'input-percentage',E'{"pattern": "0,0.[0000000000]%"}',E'1. Captura',2),
            (E'Texto',E'Campo para captura de texto',E'input-text',E'{}',E'1. Captura',0),
            (E'Número',E'Un número con decimales',E'input-number',E'{"pattern": "0,0.[0000000000]"}',E'1. Captura',1),
            (E'Párrafo',E'Campo de texto para un párrafo',E'input-paragraph',E'{"block_capture": true, "field_override": {"readonly": true}}',E'2. Utilerías',5),
            (E'Fecha',E'Texto con formato de fecha',E'date-time',E'{}',E'1. Captura',4);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
