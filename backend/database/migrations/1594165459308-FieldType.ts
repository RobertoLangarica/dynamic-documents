import { MigrationInterface, QueryRunner } from "typeorm";

export class FieldType1594165459308 implements MigrationInterface {
    name = 'FieldType1594165459308'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "field_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "component" character varying NOT NULL, "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_f402180addbf19ee29e28d5569f" UNIQUE ("name"), CONSTRAINT "PK_8feb25bdab1f9053f78b59f536d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "field_types_validations" ("field_type_id" uuid NOT NULL, "validation_id" uuid NOT NULL, CONSTRAINT "PK_730765722a83b0a74264e885aa1" PRIMARY KEY ("field_type_id", "validation_id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_0aefbdc337c5dd66e04cc1c245" ON "field_types_validations" ("field_type_id") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_f6b301a274b10ac6d0e1a837c3" ON "field_types_validations" ("validation_id") `, undefined);
        await queryRunner.query(`ALTER TABLE "field_types_validations" ADD CONSTRAINT "FK_0aefbdc337c5dd66e04cc1c2453" FOREIGN KEY ("field_type_id") REFERENCES "field_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "field_types_validations" ADD CONSTRAINT "FK_f6b301a274b10ac6d0e1a837c37" FOREIGN KEY ("validation_id") REFERENCES "validations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);

        // Default values
        let values = [
            { name: 'Entero', description: 'Un número entero', component: 'Input', parameters: {} },
            { name: 'Decimal', description: 'Un número con decimales', component: 'Input', parameters: {} },
            { name: 'Porcentaje', description: 'Un número con el postfijo %', component: 'Input', parameters: { postfix: '%' } },
            { name: 'Moneda', description: 'Un número con el formato $000.00', component: 'Input', parameters: { prefix: '$' } },
            { name: 'MXN', description: 'Un número con el formato MXN$000.00', component: 'Input', parameters: { prefix: 'MXN$' } },
            {
                name: 'USD', description: 'Un número con el formato USD$000.00', component: 'Input', parameters: { prefix: 'USD$' }
            },
            { name: 'Email', description: 'Texto con formato de correo electrónico', component: 'Input', parameters: {} },
            { name: 'Teléfono', description: 'Texto con formato de número telefónico', component: 'Input', parameters: {} },
            { name: 'Fecha', description: 'Texto con formato de fecha', component: 'InputDate', parameters: {} },
            { name: 'URL', description: 'Texto con formato de dirección web', component: 'Input', parameters: {} },
            { name: 'Opciones', description: 'Listado de opciones para elegir una', component: 'Select', parameters: {} },
            { name: 'Verdadero / Falso', description: 'Casillas de selección para verdadero y falso', component: 'Options', parameters: {} },
            { name: 'Selección múltiple', description: 'Casillas de selección para elegir más de una opción', component: 'Select', parameters: { multipleChoice: true } },
            { name: 'Párrafo', description: 'Campo de texto para un párrafo', component: 'TextArea', parameters: {} },
            { name: 'Grupo', description: 'Campo que contiene a otros campos', component: 'Group', parameters: {} }

        ]

        let valuesString = "";
        values.forEach(item => {
            let r = "(";
            r += `'${item.name}'`
            r += `,'${item.description}'`
            r += `,'${item.component}'`
            r += `,'${JSON.stringify(item.parameters)}'`
            r += `)`

            valuesString = valuesString.length > 0 ? valuesString + ',' + r : r
        })

        await queryRunner.query(`INSERT INTO "field_types" (name, description, component, parameters) VALUES ${valuesString}`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "field_types_validations" DROP CONSTRAINT "FK_f6b301a274b10ac6d0e1a837c37"`, undefined);
        await queryRunner.query(`ALTER TABLE "field_types_validations" DROP CONSTRAINT "FK_0aefbdc337c5dd66e04cc1c2453"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_f6b301a274b10ac6d0e1a837c3"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_0aefbdc337c5dd66e04cc1c245"`, undefined);
        await queryRunner.query(`DROP TABLE "field_types_validations"`, undefined);
        await queryRunner.query(`DROP TABLE "field_types"`, undefined);
    }

}
