import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { FillmapCreationDto, FillmapDto } from "./fillmap.dto";
import { Fillmap } from "./fillmap.entity";

@Injectable()
export class FillmapService {
    constructor(@InjectRepository(Fillmap)
    private readonly fillmap_repo: Repository<Fillmap>
    ) { }

    async findById(id: string): Promise<Fillmap> {
        return this.transformResponse(await this.fillmap_repo.findOne(id))
    }

    async findAll(): Promise<{items:Fillmap[]}> {
        return { items: this.transformResponse(await this.fillmap_repo.find()) }
    }

    async findBy(source:string, destination:string): Promise<{items:Fillmap[]}> {
        // source-destination
        let where:any = Object.assign({},source ? {source_type:source}:{}, destination ? {destination_type:destination}:{})
        let items = await this.fillmap_repo.find({where})
        
        // destination-source
        if(items.length === 0){
            where = Object.assign({},source ? {destination_type:source}:{}, destination ? {source_type:destination}:{})
            let reverseItems = await this.fillmap_repo.find({where})
            items = items.concat(reverseItems)
        }
        return { items: this.transformResponse(items) }
    }

    async addFillmap(data: FillmapCreationDto): Promise<Fillmap> {
        let fillmap = await this.fillmap_repo.create(data)

        try {
            fillmap = await this.fillmap_repo.save(fillmap)
            return fillmap
        } catch (e) {
            throw new InternalServerErrorException(e.message)
        }
    }

    async updateFillmap(id: string, data: FillmapDto) {
        data.id = id;
        console.log(data)
        let fillmap = await this.fillmap_repo.preload(data)

        // Avoiding duplicates
        let duplicated_key = await this.fillmap_repo.findOne({where: {
                            source_type:fillmap.source_type, 
                            destination_type:fillmap.destination_type,
                            id: Not(id) 
                        },
                        select: ['id']
                        })
        if(duplicated_key){
            throw new ConflictException(`Duplicated Fillmap. A Fillmap with source_type:${fillmap.source_type} and destination_type:${fillmap.destination_type} already exists.`)
        }

        fillmap = await this.fillmap_repo.save(fillmap)
        return this.transformResponse(fillmap)
    }

    async deleteFillmap(id: string) {
        await this.fillmap_repo.delete({ id: id })
    }

    // TODO this should be an interceptor
    transformResponse(data){
        if(Array.isArray(data)){
            return data.map(i=>{
                let r = Object.assign({},i)
                delete r.created_at
                delete r.updated_at
                return r
            })
        }

        let r = Object.assign({},data)
        delete r.created_at
        delete r.updated_at
        return r
    }
}
