import { MigrationInterface, QueryRunner } from 'typeorm'

export class FieldType1594165459308 implements MigrationInterface {
    name = 'FieldType1594165459308'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "field_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "component" character varying NOT NULL, "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_f402180addbf19ee29e28d5569f" UNIQUE ("name"), CONSTRAINT "PK_8feb25bdab1f9053f78b59f536d" PRIMARY KEY ("id"))`, undefined)
        await queryRunner.query(`CREATE TABLE "field_types_validations" ("field_type_id" uuid NOT NULL, "validation_id" uuid NOT NULL, CONSTRAINT "PK_730765722a83b0a74264e885aa1" PRIMARY KEY ("field_type_id", "validation_id"))`, undefined)
        await queryRunner.query(`CREATE INDEX "IDX_0aefbdc337c5dd66e04cc1c245" ON "field_types_validations" ("field_type_id") `, undefined)
        await queryRunner.query(`CREATE INDEX "IDX_f6b301a274b10ac6d0e1a837c3" ON "field_types_validations" ("validation_id") `, undefined)
        await queryRunner.query(`ALTER TABLE "field_types_validations" ADD CONSTRAINT "FK_0aefbdc337c5dd66e04cc1c2453" FOREIGN KEY ("field_type_id") REFERENCES "field_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined)
        await queryRunner.query(`ALTER TABLE "field_types_validations" ADD CONSTRAINT "FK_f6b301a274b10ac6d0e1a837c37" FOREIGN KEY ("validation_id") REFERENCES "validations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined)

        // Default values
        // TODO change the validation to be referenced by name since the action is not unique (and it shouldn't be unique)
        const values = [
            { name: 'Entero', description: 'Un número entero', component: 'input-number', parameters: { pattern: '0,0' }, validations: ['integer'] },
            { name: 'Número', description: 'Un número con decimales', component: 'input-number', parameters: { pattern: '0,0.000' }, validations: ['decimal'] },
            { name: 'Porcentaje', description: 'Un número decimal con el postfijo %', component: 'input-percentage', parameters: { pattern: '0,0.00' }, validations: ['decimal'] },
            { name: 'Moneda', description: 'Una cantidad con el formato $000.00', component: 'input-currency', parameters: {}, validations: ['decimal'] },
            { name: 'MXN', description: 'Una cantidad con el formato MXN$000.00', component: 'input-currency', parameters: { currency: 'MXN' }, validations: ['decimal'] },
            {
                name: 'USD', description: 'Un número con el formato USD$000.00', component: 'input-currency', parameters: { currency: 'USD' }
                , validations: ['decimal'],
            },
            { name: 'Email', description: 'Texto con formato de correo electrónico', component: 'input-text', parameters: {}, validations: ['email'] },
            { name: 'Teléfono', description: 'Texto con formato de número telefónico', component: 'input-text', parameters: {}, validations: ['numeric'] },
            { name: 'Fecha', description: 'Texto con formato de fecha', component: 'date-time', parameters: { 'null-text': 'Fecha no definida', 'no-time': true }, validations: [] },
            { name: 'URL', description: 'Texto con formato de dirección web', component: 'input-text', parameters: {}, validations: ['url'] },
            { name: 'Opciones', description: 'Listado de opciones para elegir una', component: 'select', parameters: {}, validations: [] },
            { name: 'Verdadero / Falso', description: 'Casillas de selección para verdadero y falso', component: 'boolean', parameters: {}, validations: [] },
            { name: 'Selección múltiple', description: 'Casillas de selección para elegir más de una opción', component: 'select', parameters: { multiple: true }, validations: [] },
            { name: 'Párrafo', description: 'Campo de texto para un párrafo', component: 'input-paragraph', parameters: { field_override: { readonly: true } }, validations: [] },
            { name: 'Grupo', description: 'Campo que contiene a otros campos', component: 'group', parameters: {}, validations: [] },
            { name: 'Texto', description: 'Campo para captura de texto', component: 'input-text', parameters: {}, validations: [] },

        ]

        let valuesString = ''
        values.forEach(item => {
            let r = '('
            r += `'${item.name}'`
            r += `,'${item.description}'`
            r += `,'${item.component}'`
            r += `,'${JSON.stringify(item.parameters)}'`
            r += `)`

            valuesString = valuesString.length > 0 ? valuesString + ',' + r : r
        })

        await queryRunner.query(`INSERT INTO "field_types" (name, description, component, parameters) VALUES ${valuesString}`)

        // Fill the validations
        for (let i = 0; i < values.length; i++) {
            const item = values[i]

            if (item.validations && item.validations.length > 0) {
                let f = await queryRunner.query('SELECT id FROM field_types WHERE name=$1', [item.name])
                f = f[0].id

                const validations = await queryRunner.query('SELECT id FROM validations WHERE action=ANY($1)', [item.validations])
                let values = ''
                validations.forEach(v => {
                    const toInsert = `('${f}','${v.id}')`
                    values = values.length > 0 ? `${values},${toInsert}` : `${toInsert}`
                })

                await queryRunner.query(`INSERT INTO field_types_validations (field_type_id,validation_id) VALUES ${values}`)

            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "field_types_validations" DROP CONSTRAINT "FK_f6b301a274b10ac6d0e1a837c37"`, undefined)
        await queryRunner.query(`ALTER TABLE "field_types_validations" DROP CONSTRAINT "FK_0aefbdc337c5dd66e04cc1c2453"`, undefined)
        await queryRunner.query(`DROP INDEX "IDX_f6b301a274b10ac6d0e1a837c3"`, undefined)
        await queryRunner.query(`DROP INDEX "IDX_0aefbdc337c5dd66e04cc1c245"`, undefined)
        await queryRunner.query(`DROP TABLE "field_types_validations"`, undefined)
        await queryRunner.query(`DROP TABLE "field_types"`, undefined)
    }

}
