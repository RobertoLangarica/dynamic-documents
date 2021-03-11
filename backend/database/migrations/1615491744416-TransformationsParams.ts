import {MigrationInterface, QueryRunner} from "typeorm";

export class TransformationsParams1615491744416 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let parameters = {allow_input:true}
        let transform = 'date_format'
        let dateParams = {input:'DD/MM/YY'}
        await queryRunner.query(`UPDATE transformations SET parameters=$1 WHERE name=$2`,[JSON.stringify(Object.assign({},parameters, dateParams)), transform])
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        let parameters = {}
        let transform = 'date_format'
        await queryRunner.query(`UPDATE transformations SET parameters=$1 WHERE name=$2`,[JSON.stringify(parameters), transform])
    }

}
