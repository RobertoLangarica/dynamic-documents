import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { DocumentVersion, DocumentChange } from "src/document/dto/doc_version.dto";

@Injectable()
export class DocumentVersionFillPipe implements PipeTransform {
    /**
     * Read value.fields[].value and save the change inside value.versions[] as a DocumentVersion.
     * @param value 
     * @param metadata 
     */
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.fields || value.fields.length === 0) {
            return value;
        }

        let version = new DocumentVersion()
        value.fields.forEach((field) => {
            if (field.value || field.is_new || field.deleted) {
                let obj = new DocumentChange()
                obj.field = field.id;
                obj.value = field.value;
                obj.added = field.is_new;
                obj.deleted = field.deleted;
                version.changes.push(obj)
            }
        })

        if (version.changes.length > 0) {
            value.versions = [version]
        }

        return value
    }

}