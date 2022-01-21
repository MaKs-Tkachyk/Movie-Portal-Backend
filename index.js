require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')




const router = require('./router/index')
const errorMeddlewear = require("./middlewares/erros-middlewares")
const fileUpload = require("express-fileupload")
const filePathMiddleware = require("./middlewares/filePath-middlewares")
const staticPathMiddleware = require("./middlewares/staticPath-middlewares")



const PORT = process.env.PORT || 5000

const path = require('path')

const app = express()





app.use(fileUpload({}))
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use('/api', router)
app.use(errorMeddlewear)
app.use(filePathMiddleware(path.resolve(__dirname, "files")))
app.use(staticPathMiddleware(path.resolve(__dirname, "static")))
app.use(express.static(path.resolve(__dirname, "static")))







const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => { console.log(`Server started on PORT = ${PORT}`) })
    }
    catch (e) {
        console.log(e)
    }
}




start()