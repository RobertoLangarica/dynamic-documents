import {MigrationInterface, QueryRunner} from "typeorm";

export class FormatNumberTransforms1615587607756 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let inserts = []
        let params:{[key:string]:any}= {input:'0,0.[00]',allow_input:true}
        let name = 'number'
        inserts.push(queryRunner.query(`INSERT INTO transformations (name, description, parameters) VALUES ($1,'',$2)`,[name,JSON.stringify(params)]))
        
        params = {input:'$0,0.00'}
        name = 'currency'
        inserts.push(queryRunner.query(`INSERT INTO transformations (name, description, parameters) VALUES ($1,'',$2)`,[name,JSON.stringify(params)]))

        params = {input:'0%'}
        name = 'percentage'
        inserts.push(queryRunner.query(`INSERT INTO transformations (name, description, parameters) VALUES ($1,'',$2)`,[name,JSON.stringify(params)]))

        await Promise.all(inserts)

        await queryRunner.query(`ALTER TABLE transformations DROP COLUMN description`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transformations ADD COLUMN "description" character varying DEFAULT ''`)
        await queryRunner.query(`DELETE FROM transformations WHERE name=$1 OR name=$2 OR name=$3`,['number', 'currency', 'percentage'] )
    }
}
