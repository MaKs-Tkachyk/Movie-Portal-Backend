const fileService = require('../service/file-service')
const User = require('../models/user-models')
const File = require('../models/file-model')
const fs = require('fs')
const Uuid = require("uuid")
const path = require('path')

class FileController {
    async createDir(req, res) {
        try {
            const { name, type, parent } = req.body
            const file = new File({ name, type, parent, user: req.user.id })
            const parentFile = await File.findOne({ _id: parent })
            if (!parentFile) {
                file.path = name
                await fileService.createDir(req, file)
            } else {
                file.path = `${parentFile.path}\\${file.name}`
                await fileService.createDir(req, file)
                parentFile.childs.push(file._id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (e) {
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async getFiles(req, res) {
        try {
            const files = await File.find({ user: req.user.id, parent: req.query.parent })
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: "Can not get files" })
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file
            console.log(req.files.file)
            const parent = await File.findOne({ user: req.user.id, _id: req.body.parent })
            const user = await User.findOne({ _id: req.user.id })

            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({ message: "There no space on the disk" })
            }

            user.usedSpace = user.usedSpace + file.size

            let path
            if (parent) {
                path = `${req.filePath}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${req.filePath}\\${user._id}\\${file.name}`
            }

            if (fs.existsSync(path)) {
                return res.status(400).json({ message: "File already exist" })
            }

            file.mv(path)
            const type = file.name.split('.').pop()
            const dbFile = new File({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent ? parent._id : null,
                user: user._id
            })

            await dbFile.save()
            await user.save()

            res.json(dbFile)

        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: `Upload erorr` })
        }
    }

    async downloadFile(req, res) {
        try {
            const file = await File.findOne({ _id: req.query.id, user: req.user.id })
            const path = fileService.getPath(req, file)
            if (fs.existsSync(path)) {
                return res.download(path, file.name)
            }
            return res.status(400).json({ message: "Download error" })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Download error" })
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files.file
            const user = await User.findById(req.user.id)
            const avatarName = Uuid.v4() + ".jpg"
            file.mv(req.staticPath + "\\" + avatarName)
            user.avatar = avatarName
            await user.save()
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Upload avatar error' })
        }
    }

    async changeAvatar(req, res) {
        try {
            console.log()
            const file = req.body.file
            console.log(file)
            const user = await User.findById(req.user.id)
            user.avatar = file
            await user.save()
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Upload avatar error' })
        }
    }

    async deleteAvatar(req, res) {
        try {
            const user = await User.findById(req.user.id)
            fs.unlinkSync(req.staticPath + "\\" + user.avatar)
            user.avatar = null
            await user.save()
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Delete avatar error' })
        }
    }
}


module.exports = new FileController()








