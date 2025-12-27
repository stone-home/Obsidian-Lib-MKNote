import {FrontmatterBase} from "../types"


export interface IZettelProperties extends FrontmatterBase {
    id: string;
    create: string;
    sources: string[];
    url?: string;
    tags: string[];
}
