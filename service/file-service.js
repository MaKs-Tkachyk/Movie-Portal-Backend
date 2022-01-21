const fs = require('fs')
const File = require('../models/file-model')
const path = require('path')
const uuid = require('uuid')


class FileService {

    createDir(req, file) {
        const filePath = this.getPath(req, file)
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({ message: 'File was created' })
                } else {
                    return reject({ message: "File already exist" })
                }
            } catch (e) {
                return reject({ message: 'File error' })
            }
        }))
    }

    getPath(req, file) {
        return `${req.filePath}\\${file.user}\\${file.path}`
    }

    saveFile(file) {
        try {
            if (!fs.existsSync(path.resolve('static'))) {
                fs.mkdirSync((path.dirname(__dirname), 'static'), (err) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log("Папка создана")
                })
            }
            const fileName = uuid.v4() + '.jpg';
            const filePath = path.resolve('static', fileName);
            file.mv(filePath);
            return fileName;
        } catch (e) {
            console.log(e)
        }
    }
}


module.exports = new FileService()





