import { PipeTransform, ArgumentMetadata, Injectable, NotFoundException } from "@nestjs/common";
import { FillmapCreationDto } from "src/fillmaps/fillmap.dto";
import { FillmapService } from "src/fillmaps/fillmap.service";

@Injectable()
export class ExistsFillmapPipe implements PipeTransform {
    constructor(private readonly fillmap_service: FillmapService) { }

    /**
     * Search for a Fillmap with value as id and expects to find it
     * @param value 
     * @param metadata 
     */
    async transform(value: string, metadata: ArgumentMetadata) {
        try{
            await this.fillmap_service.findById(value)
        }catch(e){
            throw new NotFoundException('The Fillmap should be be an existing one')
        }

        return value
    }
}