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
        return await this.fillmap_repo.findOne(id)
    }

    async findAll(): Promise<{items:Fillmap[]}> {
        return { items: await this.fillmap_repo.find() }
    }

    async findBy(source:string, destination:string): Promise<{items:Fillmap[]}> {
        let where:any = Object.assign({},source ? {source_type:source}:{}, destination ? {destination_type_id:destination}:{})

        return { items: await this.fillmap_repo.find({where}) }
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
        let fillmap = await this.fillmap_repo.preload(data)

        // Avoiding duplicates
        let duplicated_key = await this.fillmap_repo.findOne({where: {
                            source_type:fillmap.source_type, 
                            destination_type_id:fillmap.destination_type_id,
                            id: Not(id) 
                        },
                        select: ['id']
                        })
        if(duplicated_key){
            throw new ConflictException(`Duplicated Fillmap. A Fillmap with source_type:${fillmap.source_type} and destination_type_id:${fillmap.destination_type_id} already exists.`)
        }

        fillmap = await this.fillmap_repo.save(fillmap)
        return fillmap
    }

    async deleteFillmap(id: string) {
        await this.fillmap_repo.delete({ id: id })
    }
}
