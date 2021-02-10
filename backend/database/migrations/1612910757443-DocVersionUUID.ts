import {MigrationInterface, QueryRunner} from "typeorm";
import { v4 as uuidv4 } from 'uuid'

export class DocVersionUUID1612910757443 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        let docs = await queryRunner.query('SELECT id,versions FROM documents ')
        
        let versions
        let updates:Promise<any>[] = [] 
        // Adding an unique UUID for each version
        for(let i = 0; i < docs.length; i++){
            versions = docs[i].versions
            versions = versions.map(v=>Object.assign({id:uuidv4()},v))
            updates.push(queryRunner.query('UPDATE documents SET versions=$1 WHERE id=$2',[JSON.stringify(versions),docs[i].id]))
        }

        await Promise.all(updates)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        let docs = await queryRunner.query('SELECT id,versions FROM documents ')
        
        let versions
        let updates:Promise<any>[] = [] 
        // Removing the UUID from each version
        for(let i = 0; i < docs.length; i++){
            versions = docs[i].versions
            versions = versions.map(v=>{
                delete v.id
                return v
            })
            updates.push(queryRunner.query('UPDATE documents SET versions=$1 WHERE id=$2',[JSON.stringify(versions),docs[i].id]))
        }

        await Promise.all(updates)
    }

}
