import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingBorderToField1625618714239 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let documents = await queryRunner.query(`SELECT id,fields FROM documents`)
        documents = documents.map(doc=>{
            doc.fields = doc.fields.map(f=>({...f, border:0}))
            return doc
        })

        await Promise.all(documents.map(doc=> queryRunner.query(`UPDATE documents SET fields=$1 WHERE id=$2`,[JSON.stringify(doc.fields),doc.id])))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let documents = await queryRunner.query(`SELECT id,fields FROM documents`)
        documents = documents.map(doc=>{
            doc.fields = doc.fields.map(f=>{
                delete f.border
                return f
            })
            return doc
        })

        await Promise.all(documents.map(doc=> queryRunner.query(`UPDATE documents SET fields=$1 WHERE id=$2`,[JSON.stringify(doc.fields),doc.id])))
    }

}
