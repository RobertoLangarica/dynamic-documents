
export interface IFillmapField {
    foreign: string
    destination:string
}

export interface IFillmap{
    id?:string;
    source_type:string;
    destination_type:string;
    fields:IFillmapField[];
}
