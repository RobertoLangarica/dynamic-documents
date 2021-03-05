import {MigrationInterface, QueryRunner} from "typeorm";

export class BlockParagraphCapture1614975584857 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adding block_capture
        let parameters = {"block_capture":true, "field_override": {"readonly": true}}
        await queryRunner.query(`UPDATE field_types SET parameters = $1 WHERE name=$2`,[JSON.stringify(parameters), 'Párrafo'])

        let docs = await queryRunner.query('SELECT id,fields FROM documents')
        let edits = []
        docs.forEach(doc=>{
            let changed = false
            doc.fields.forEach(field => {
                if(field.type.name === 'Párrafo'){
                    Object.assign(field.type.parameters,{block_capture:true})
                    changed = true
                }
            });

            if(changed){
                edits.push(queryRunner.query('UPDATE documents SET fields=$1 WHERE id=$2', [JSON.stringify(doc.fields),doc.id]))
            }
        })
        await Promise.all(edits)
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        // removing block_capture
        let parameters = {"field_override": {"readonly": true}}
        await queryRunner.query(`UPDATE field_types SET parameters = $1 WHERE name=$2`,[JSON.stringify(parameters), 'Párrafo'])

        let docs = await queryRunner.query('SELECT id,fields FROM documents')
        let edits = []
        docs.forEach(doc=>{
            let changed = false
            doc.fields.forEach(field => {
                if(field.type.name === 'Párrafo'){
                    Object.assign(field.type.parameters,{block_capture:true})
                    field.type.parameters = parameters
                    changed = true
                }
            });

            if(changed){
                edits.push(queryRunner.query('UPDATE documents SET fields=$1 WHERE id=$2', [JSON.stringify(doc.fields),doc.id]))
            }
        })
        await Promise.all(edits)
    }

}
