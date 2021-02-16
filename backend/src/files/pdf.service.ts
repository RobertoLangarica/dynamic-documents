import { Injectable } from "@nestjs/common";
import { Document } from "src/document/document.entity";
const puppeteer = require('puppeteer');

@Injectable()
export class PDFService {
    active:boolean = false;
    browser;
    page;

    async createFromDocument(document:Document,auth:string = ''):Promise<Buffer>{
        await this.startBrowser()
        let path = `${process.env.PUBLIC_PDF_URL}/${document.id}${auth ? `?auth=${auth}`:''}`
        console.log(path)
        await this.page.goto(path, { waitUntil: 'networkidle2' })
        let res = await this.page.pdf({ format: 'Letter' });
        await this.browser.close()
        return res
    }

    async startBrowser(){
        this.browser = await puppeteer.launch({
            headless:true,
            args: ['--disable-dev-shm-usage']
        })
        this.page = await this.browser.newPage()
    }

    async stop(){
        if(this.browser){
            await this.browser.close()
        }
    }
}