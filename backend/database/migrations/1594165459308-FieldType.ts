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

        // await queryRunner.query(`INSERT INTO "field_types" (name, description, component, parameters) VALUES (“Entero”, “Un número entero”,”Input”, {}),(“Decimal”, “Un número con decimales”,”Input”, {}),(“Porcentaje”, “Un número con el postfijo %”,”Input”,{“postfix”:”%”}),(“Moneda”, “Un número con el formato $000.00”,”Input”,{“prefix”:”$”}),(“MXN”, “Un número con el formato MXN$000.00”,”Input”,{“prefix”:”MXN$”}),(“USD”, “Un número con el formato USD$000.00”,”Input”,{“prefix”:”USD$”}),(“Email”, “Texto con formato de correo electrónico”,”Input”,{}),(“Teléfono”, “Texto con formato de número telefónico”,”Input”,{}),(“Fecha”, “Texto con formato de fecha”,”InputDate”,{}),(“URL”, “Texto con formato de dirección web”,”Input”,{}),(“Opciones”, “Listado de opciones para elegir una”,”Select”,{}),(“Verdadero/Falso”, “Casillas de selección para verdadero y falso”,”Options”,{}),(“Selección múltiple”, “Casillas de selección para elegir más de una opción”,”Select”,{“multipleChoice”:true}),(“Párrafo”, “Campo de texto para un párrafo”,”TextArea”,{}),(“Grupo”, “Campo que contiene a otros campos”,”Group”,{})`)
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
