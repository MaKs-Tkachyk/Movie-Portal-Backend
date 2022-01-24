const { Router } = require("express");
const userController = require('../controllers/user-controllers')
const { body } = require('express-validator')
const authMiddlewares = require('../middlewares/auth-middlewares');
const fileController = require("../controllers/file-controller");
const filmController = require("../controllers/film-controller");



const router = new Router()

//auth
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.active)
router.get('/refresh', userController.refresh);
router.get('/users', authMiddlewares, userController.getUsers)


//files
router.post('/files', authMiddlewares, fileController.createDir)
router.get('/files', authMiddlewares, fileController.getFiles)
router.post('/files/upload', authMiddlewares, fileController.uploadFile)
router.post('/files/uploadAvatar', authMiddlewares, fileController.uploadAvatar)
router.post('/files/changeAvatar', authMiddlewares, fileController.changeAvatar)
router.get('/files/download', authMiddlewares, fileController.downloadFile)
router.delete('/files/avatar', authMiddlewares, fileController.deleteAvatar)

//posts

router.post('/film', authMiddlewares, filmController.create)
router.post('/film/genre', filmController.getFilmGenre)
router.get('/films', authMiddlewares, filmController.getAll)
router.get('/film/:name?', authMiddlewares, filmController.getOne)
router.get('/profileFilm/:id?', authMiddlewares, filmController.findFilmId)
router.put('/film', authMiddlewares, filmController.update)
router.delete('/film/:name', authMiddlewares, filmController.delete)


module.exports = router