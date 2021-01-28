import { MigrationInterface, QueryRunner, getRepository, TableColumn, Repository } from 'typeorm';
import { FieldType } from '../../src/field_types/field_type.entity';

// tslint:disable:max-line-length
export class UpdateFieldTypes1611809455558 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('TRUNCATE TABLE "field_types" CASCADE')
        await queryRunner.addColumn('field_types', new TableColumn({ name: 'category', type: 'varchar' }))
        await queryRunner.addColumn('field_types', new TableColumn({ name: 'order', type: 'int' }))
        const values = [
            { category: '1. Texto',     order: 0, name: 'Texto libre',  description: 'Campo para captura de texto', component: 'input-text', parameters: {}, validations: [] },
            { category: '2. Captura',   order: 0, name: 'Entero',       description: 'Un número entero', component: 'input-number', parameters: { pattern: '0,0' }, validations: ['integer'] },
            { category: '2. Captura',   order: 1, name: 'Número',       description: 'Un número con decimales', component: 'input-number', parameters: { pattern: '0,0.000' }, validations: ['decimal'] },
            { category: '2. Captura',   order: 2, name: 'Porcentaje',   description: 'Un número decimal con el postfijo %', component: 'input-percentage', parameters: { pattern: '0,0.00' }, validations: ['decimal'] },
            { category: '2. Captura',   order: 3, name: 'Moneda',       description: 'Una cantidad con el formato $000.00', component: 'input-currency', parameters: {}, validations: ['decimal'] },
            { category: '2. Captura',   order: 4, name: 'Fecha',        description: 'Texto con formato de fecha', component: 'date-time', parameters: { 'null-text': 'Fecha no definida', 'no-time': true }, validations: [] },
            { category: '2. Captura',   order: 5, name: 'Párrafo',      description: 'Campo de texto para un párrafo', component: 'input-paragraph', parameters: { field_override: { readonly: true } }, validations: [] },
            { category: '2. Captura',   order: 6, name: 'Grupo',        description: 'Campo que contiene a otros campos', component: 'group', parameters: {}, validations: [] },
            { category: '3. Utilerías', order: 0, name: 'Texto',        description: 'Campo para captura de texto', component: 'input-text', parameters: {}, validations: [] },
        ]
        await queryRunner.manager.getRepository(FieldType).save(values as any)
        await this.fillValidations(values, queryRunner)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('TRUNCATE TABLE "field_types" CASCADE')
        await queryRunner.dropColumn('field_types', 'category')
        await queryRunner.dropColumn('field_types', 'order')
    }

    private async fillValidations(values, queryRunner: QueryRunner) {
        for (let i = 0; i < values.length; i++) {
            const item = values[i]
            if (item.validations && item.validations.length > 0) {
                let f = await queryRunner.query('SELECT id FROM field_types WHERE name=$1', [item.name])
                f = f[0].id
                const validations = await queryRunner.query('SELECT id FROM validations WHERE action=ANY($1)', [item.validations])
                let valuesSentence = ''
                validations.forEach(v => {
                    const toInsert = `('${f}','${v.id}')`
                    valuesSentence = valuesSentence.length > 0 ? `${valuesSentence},${toInsert}` : `${toInsert}`
                })
                await queryRunner.query(`INSERT INTO field_types_validations (field_type_id,validation_id) VALUES ${valuesSentence}`)
            }
        }
    }
}
