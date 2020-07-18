import { SetMetadata } from "@nestjs/common";

export const DocIdParam = (id_param_name: string) => SetMetadata('doc_id', id_param_name)