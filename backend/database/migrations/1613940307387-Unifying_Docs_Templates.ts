import { DocumentConfig } from "src/document/document.config";
import {MigrationInterface, QueryRunner} from "typeorm";
import { Templates1594356865534 } from "./1594356865534-Templates";

export class UnifyingDocsTemplates1613940307387 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`ALTER TABLE documents ADD COLUMN is_template boolean NOT NULL DEFAULT FALSE`)
        
        let status = (await queryRunner.query('SELECT * FROM status WHERE name=$1',[DocumentConfig.initialState]))[0]
        let templates = await queryRunner.query('SELECT * FROM templates ')
        templates = templates.map(element => {
            element.is_template = true
            element.statusId = status.id
            element.fields = JSON.stringify(element.fields)
            return element
        });

        // INSERT templates into documents
        if(templates.length > 0 ){
            await runInsert('documents',templates,queryRunner)
        }

        
        await queryRunner.query(`UPDATE "documents" SET document_source = template_source WHERE is_template=FALSE`);
        await queryRunner.query(`ALTER TABLE documents DROP COLUMN template_source`)
        await queryRunner.query(`ALTER TABLE documents DROP COLUMN computed_capture`)
        await queryRunner.query(`ALTER TABLE documents DROP COLUMN computed_print`)

        // Deleting templates from DB
        let templateMigration = new Templates1594356865534()
        await templateMigration.down(queryRunner)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreating templates in the DB
        let templateMigration = new Templates1594356865534()
        await templateMigration.up(queryRunner)

        // Inserting templates
        let templates = await queryRunner.query('SELECT * FROM documents WHERE is_template=TRUE')
        if(templates.length > 0){
            templates = templates.map(element=>{
                return Object.assign({},{
                    id:element.id,
                    created_at:element.created_at,
                    updated_at:element.updated_at,
                    name:element.name,
                    description:element.description,
                    fields: JSON.stringify(element.fields),
                    typeId:element.typeId,
                })
            })
            runInsert('templates',templates,queryRunner)
        }
        
        // Deleting templates from documents
        await queryRunner.manager.createQueryBuilder()
                            .delete()
                            .from('documents')
                            .where('is_template=TRUE')
                            .execute()

        await queryRunner.query(`ALTER TABLE documents ADD COLUMN template_source uuid`)
        await queryRunner.query(`UPDATE "documents" SET template_source = document_source WHERE is_template=FALSE`);

        await queryRunner.query(`ALTER TABLE documents ADD COLUMN computed_capture character varying`)
        await queryRunner.query(`ALTER TABLE documents ADD COLUMN computed_print character varying`)
        await queryRunner.query(`ALTER TABLE documents DROP COLUMN is_template`)
    }
}

const runInsert = (table, values, queryRunner)=>{
    let queryString = ''
    let keys = ''
    // keys
    Object.keys(values[0]).forEach(key=>{
        if(keys.length > 0){
            keys += ', '
        }
        keys += `"${key}"`
    })
    keys = `(${keys})`
    // values
    let params = []
    let value_query = ''
    values.forEach(element => {
        let values = ''
        Object.keys(element).forEach(key=>{
            if(values.length > 0){
                values += ', ' 
            }
            values += `$${params.push(element[key])}`
        })
        if(value_query.length > 0){
            value_query += ', ' 
        }
        value_query += `(${values})`
    });
    queryString = `INSERT INTO "${table}"${keys} VALUES ${value_query} RETURNING *`
    return queryRunner.query(queryString, params)
}
