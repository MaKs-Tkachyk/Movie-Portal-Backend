const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')
const ApiError = require('../exeptions/api-error')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

class FileService {
    async uploadFile(file) {
        const fileStream = fs.createReadStream(file.path)

        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: file.filename
        }

        return s3.upload(uploadParams).promise()
    }

    async checkFile(fileKey) {
        try {
            const params = { Bucket: bucketName, Key: fileKey };
            const picture = await s3.getObject(params).promise();
            return picture && "200"
        } catch (e) {
            return e.statusCode
        }
    }

    async deleteFile(fileKey) {

        if(!fileKey){
            throw ApiError.BadRequest('Фильм не найден')
        }
            const params = { Bucket: bucketName, Key: fileKey };
            const picture = await s3.deleteObject(params).promise();
            return picture 

    }


}

// 
module.exports = new FileService()





