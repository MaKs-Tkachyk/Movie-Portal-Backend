require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const util = require('util')
const User = require('../models/user-models')
const FileService = require("../service/file-service")

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const unlinkFile = util.promisify(fs.unlink)

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})






class FileController {

  async changeAvatar(req, res) {
    try {
      const file = req.file
      const user = await User.findById(req.user.id)
      console.log(file)
      if (user.avatar) {
        console.log(1)
        let key = user.avatar.split("/").pop()
        console.log(key)
        FileService.deleteFile(key)
        console.log(1)
      }
      const result = await FileService.uploadFile(file)
      unlinkFile(file.path)
      user.avatar = result.Location
      await user.save()
      return res.json({ avatar: result.Location })
    } catch (e) {
      console.log(e)
      return res.status(400).json({ message: 'Upload avatar error' })
    }
  }



}

module.exports = new FileController()








