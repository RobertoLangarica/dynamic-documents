import { Injectable } from "@nestjs/common"
import S3 from 'aws-sdk/clients/s3'

@Injectable()
export class StorageService{
    s3:S3;

    constructor (){
        this.s3 = new S3({
            region: process.env.S3_REGION,
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET,
            endpoint: process.env.S3_ENDPOINT,
          })
    }

    async exists(documentID:string, version:string, extension:string = 'pdf', folder:string='dynamic-documents'):Promise<boolean>{
        let path = `${folder}/${documentID}/${version}.${extension}`
        return new Promise((resolve, reject)=>{
            this.s3.headObject({
                Bucket:process.env.S3_BUCKET,
                Key:path
            },(err,data)=>{
                if(err){
                    if(err.code && err.code === 'NotFound'){
                        resolve(false)
                    } else {
                        reject(err)
                    }
                    return
                }
                console.log(data)
                resolve(true)
            })
        })
    }

    async getFile(documentID:string, version:string, extension:string = 'pdf', folder:string='dynamic-documents'):Promise<Buffer>{
        // Get and return the file
        let path = `${folder}/${documentID}/${version}.${extension}`
        return new Promise((resolve, reject)=>{
            this.s3.getObject({
                Bucket:process.env.S3_BUCKET,
                Key: path,
            },(err,data)=>{
                if(err){
                    reject(err)
                    return
                }
                // console.log(data)
                resolve(data.Body as any)
            })
        })
        
    }

    async deleteFileVersions(documentID:string, versionToPreserve:string, extension:string = 'pdf', folder:string='dynamic-documents'){
        // Delete all the other file versions
        let path = `${folder}/${documentID}/`
        let preserveKey = `${path}${versionToPreserve}.${extension}`
        this.s3.listObjectsV2({
            Bucket:process.env.S3_BUCKET,
            Prefix: path
        }).promise().then((result)=>{
            let toDelete = result.Contents.filter(c=>c.Key !== preserveKey)

            if(toDelete.length > 0){
                toDelete = toDelete.map(o=>Object.assign({},{Key:o.Key}))
                // something to delete
                this.s3.deleteObjects({
                    Bucket:process.env.S3_BUCKET,
                    Delete: {Objects:toDelete as any, Quiet:false},
                }, (err, data)=>{
                    if(err){
                        console.log(err,err.stack)
                    } else {
                        console.log(data)
                    }
                })
            }
        })
    }

    async saveFile(documentID:string, version:string, data:Buffer, extension:string = 'pdf', folder:string='dynamic-documents'){
        let path = `${folder}/${documentID}/${version}.${extension}`
        // Saving file
        await this.s3.upload({
            Bucket:process.env.S3_BUCKET,
            Key: path,
            Body: data,
            ACL: 'public-read'
        }).promise()
    }
}