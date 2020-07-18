import { SetMetadata } from "@nestjs/common";

export const AllowedStatus = (...status: string[]) => SetMetadata('allowed_status', status)