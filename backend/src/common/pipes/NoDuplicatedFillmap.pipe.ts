import { PipeTransform, ArgumentMetadata, Injectable, ConflictException } from "@nestjs/common";
import { FillmapCreationDto } from "src/fillmaps/fillmap.dto";
import { FillmapService } from "src/fillmaps/fillmap.service";

@Injectable()
export class NoDuplicatedFillmapPipe implements PipeTransform {
    constructor(private readonly fillmap_service: FillmapService) { }

    /**
     * Search for a Fillmap with source_type and destination_type and
     * expects not to find any
     * @param value 
     * @param metadata 
     */
    async transform(value: FillmapCreationDto, metadata: ArgumentMetadata) {
        let results = await this.fillmap_service.findBy(value.source_type, value.destination_type)
        if(results.items.length > 0){
            throw new ConflictException(`Duplicated Fillmap. A Fillmap with source_type:${value.source_type} and destination_type:${value.destination_type} already exists.`)
        }

        return value
    }
}