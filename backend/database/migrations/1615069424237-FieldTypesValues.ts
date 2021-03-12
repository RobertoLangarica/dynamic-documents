import {MigrationInterface, QueryRunner} from "typeorm";

export class FieldTypesValues1615069424237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let parameters = {pattern:'0,0'}
        let typeName = 'Entero'
        let component = 'input-integer'
        await queryRunner.query(`UPDATE field_types SET component=$1,parameters=$3 WHERE name=$2`,[component, typeName, JSON.stringify(parameters)])
        
        let numberParameters = {pattern:'0,0.[0000000000]'}
        let numberName = 'Número'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[numberName, JSON.stringify(numberParameters)])

        let percentParameters = {pattern:'0,0.[0000000000]%'}
        let percentName = 'Porcentaje'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[percentName, JSON.stringify(percentParameters)])

        let currencyParameters = {pattern:'0,0.00', prefix:'$'}
        let currencyName = 'Moneda'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[currencyName, JSON.stringify(currencyParameters)])
        
        // Changing all the fields
        let docs = await queryRunner.query('SELECT id,fields FROM documents')
        let edits = []
        docs.forEach(doc=>{
            let changed = false
            doc.fields.forEach(field => {
                switch(field.type.name){
                    case typeName:
                        Object.assign(field.type.parameters,parameters)
                        field.type.component = component
                        changed = true
                        break;
                    case numberName:
                        Object.assign(field.type.parameters,numberParameters)
                        changed = true
                        break;
                    case percentName:
                        Object.assign(field.type.parameters,percentParameters)
                        changed = true
                        break;
                    case currencyName:
                        Object.assign(field.type.parameters,currencyParameters)
                        changed = true
                        break;
                }
            });
            
            if(changed){
                edits.push(queryRunner.query('UPDATE documents SET fields=$1 WHERE id=$2', [JSON.stringify(doc.fields),doc.id]))
            }
        })
        await Promise.all(edits)
        
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        let parameters = {}
        let typeName = 'Entero'
        let component = 'input-number'
        await queryRunner.query(`UPDATE field_types SET component=$1, parameters=$3 WHERE name=$2`,[component, typeName, JSON.stringify(parameters)])
        
        let numberParameters = {}
        let numberName = 'Número'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[numberName, JSON.stringify(numberParameters)])

        let percentParameters = {}
        let percentName = 'Porcentaje'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[percentName, JSON.stringify(percentParameters)])

        let currencyParameters = {}
        let currencyName = 'Moneda'
        await queryRunner.query(`UPDATE field_types SET parameters=$2 WHERE name=$1`,[currencyName, JSON.stringify(currencyParameters)])

        // Changing all the fields
        let docs = await queryRunner.query('SELECT id,fields FROM documents')
        let edits = []
        docs.forEach(doc=>{
            let changed = false
            doc.fields.forEach(field => {
                switch(field.type.name){
                    case typeName:
                        field.type.parameters = parameters
                        field.type.component = component
                        changed = true
                        break;
                    case numberName:
                        field.type.parameters = numberParameters
                        changed = true
                        break;
                    case percentName:
                        field.type.parameters = percentParameters
                        changed = true
                        break;
                    case currencyName:
                        field.type.parameters = currencyParameters
                        changed = true
                        break;
                }
            });
            
            if(changed){
                edits.push(queryRunner.query('UPDATE documents SET fields=$1 WHERE id=$2', [JSON.stringify(doc.fields),doc.id]))
            }
        })
        await Promise.all(edits)
    }

}
