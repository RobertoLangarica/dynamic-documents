import { Transform } from "class-transformer"

export abstract class DDEntityWithTimeStampt {
    id: string = ''

    @Transform(value => new Date(value).toISOString(), { toClassOnly: true })
    readonly created_at: string = ''

    @Transform(value => new Date(value).toISOString(), { toClassOnly: true })
    readonly updated_at: string = ''
}
