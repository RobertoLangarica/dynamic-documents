import { Injectable } from "@nestjs/common";
import { Document } from "src/document/document.entity";
const puppeteer = require('puppeteer');

@Injectable()
export class PDFService {
    active:boolean = false;
    browser;
    page;

    async createFromDocument(document:Document):Promise<Buffer>{
        await this.startIfNeeded()
        await this.page.goto(`${process.env.PUBLIC_PDF_URL}/${document.id}`, { waitUntil: 'networkidle2' })
        let res = await this.page.pdf({ format: 'Letter' });
        return res
    }

    async startIfNeeded(){
        if(this.active){return}

        this.browser = await puppeteer.launch({
            headless:true,
            args: ['--disable-dev-shm-usage']
        })
        this.page = await this.browser.newPage()
        this.active = true
    }

    async stop(){
        if(this.browser){
            await this.browser.close()
        }
    }
}