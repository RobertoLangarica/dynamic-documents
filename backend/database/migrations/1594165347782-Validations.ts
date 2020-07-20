import { MigrationInterface, QueryRunner } from "typeorm";

export class Validations1594165347782 implements MigrationInterface {
    name = 'Validations1594165347782'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "validations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "action" character varying NOT NULL, "error_message" character varying NOT NULL, "parameters" jsonb DEFAULT '{}', CONSTRAINT "UQ_f2d56f6642c79b45ac37dbace09" UNIQUE ("name"), CONSTRAINT "PK_d523bd8c24ea354126be8cff546" PRIMARY KEY ("id"))`, undefined);

        // Default values
        let values = [
            { name: 'Campo requerido', description: '', action: 'required', error_message: '', parameters: {} },
            { name: 'Tamaño mínimo', description: '', action: 'minLength', error_message: '', parameters: {} },
            { name: 'Tamaño máximo', description: '', action: 'maxLength', error_message: '', parameters: {} },
            { name: 'Valor mínimo', description: '', action: 'minValue', error_message: '', parameters: {} },
            { name: 'Valor máximo', description: '', action: 'maxValue', error_message: '', parameters: {} },
            { name: 'Valor dentro de un rango', description: '', action: 'between', error_message: '', parameters: {} },
            { name: 'Acepta sólo carácteres del alfabeto', description: '', action: 'alpha', error_message: '', parameters: {} },
            { name: 'Acepta números y carácteres del alfabeto', description: '', action: 'alphaNum', error_message: '', parameters: {} },
            { name: 'Acepta sólo carácteres númericos', description: '', action: 'numeric', error_message: '', parameters: {} },
            { name: 'Acepta números enteros positivos y negativos', description: '', action: 'integer', error_message: '', parameters: {} },
            { name: 'Acepta números decimales positivos y negativos', description: '', action: 'decimal', error_message: '', parameters: {} },
            { name: 'Acepta direcciones de correo validas', description: '', action: 'email', error_message: '', parameters: {} },
            { name: 'Acepta direcciones IPv4', description: '', action: 'ipAddress', error_message: '', parameters: {} },
            { name: 'Acepta direcciones MAC', description: '', action: 'macAddress', error_message: '', parameters: {} },
            { name: 'Acepta URLs', description: '', action: 'url', error_message: '', parameters: {} },
            { name: 'Sólo acepta el valor true', description: '', action: 'isTrue', error_message: '', parameters: {} },
        ]

        let valuesString = "";
        values.forEach(item => {
            let r = "";
            Object.entries(item).forEach(kv => {
                let vs = typeof kv[1] === 'object' ? JSON.stringify(kv[1]) : kv[1].toString()

                r = r.length > 0 ? r + ',' + `'${vs}'` : `'${vs}'`
            })
            r = `(${r})`

            valuesString = valuesString.length > 0 ? valuesString + ',' + r : r
        })

        await queryRunner.query(`INSERT INTO "validations" (name, description, action, error_message, parameters) VALUES ${valuesString}`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "validations"`, undefined);
    }

}
