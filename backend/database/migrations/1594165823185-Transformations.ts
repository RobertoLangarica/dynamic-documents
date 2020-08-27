import { MigrationInterface, QueryRunner } from "typeorm";

export class Transformations1594165823185 implements MigrationInterface {
    name = 'Transformations1594165823185'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transformations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_6bd2549fa224ce4e8a8d0dc3f37" UNIQUE ("name"), CONSTRAINT "PK_64d8104dbdd72b30b53702035dd" PRIMARY KEY ("id"))`, undefined);

        // Default values
        const values = [
            { name: 'uppercase', description: 'uppercase', parameters: {} },
            { name: 'lowercase', description: 'lowercase', parameters: {} },
            { name: 'first_letter_upercase', description: 'first_letter_upercase', parameters: {} },
            { name: 'date_format', description: 'date_format', parameters: {} },
            { name: 'number_to_text', description: 'number_to_text', parameters: {} },
            { name: 'text_to_number', description: 'text_to_number', parameters: {} },
            { name: 'ceil', description: 'ceil', parameters: {} },
            { name: 'round', description: 'round', parameters: {} },
            { name: 'floor', description: 'floor', parameters: {} }
        ]

        let valuesString = ''
        values.forEach(item => {
            let r = '('
            r += `'${item.name}'`
            r += `,'${item.description}'`
            r += `,'${JSON.stringify(item.parameters)}'`
            r += `)`

            valuesString = valuesString.length > 0 ? valuesString + ',' + r : r
        })

        await queryRunner.query(`INSERT INTO "transformations" (name, description, parameters) VALUES ${valuesString}`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "transformations"`, undefined);
    }

}
