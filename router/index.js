const { Router } = require("express");
const userController = require('../controllers/user-controllers')
const { body } = require('express-validator')
const authMiddlewares = require('../middlewares/auth-middlewares');
const fileController = require("../controllers/file-controller");
const filmController = require("../controllers/film-controller");
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const router = new Router()

//auth
router.post('/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.active)
router.post('/refresh', userController.refresh);
router.get('/users', authMiddlewares, userController.getUsers)


//files

router.post('/changeAvatar', [upload.single('img'), authMiddlewares], fileController.changeAvatar)


//posts

router.post('/film', [upload.single('picture'),authMiddlewares], filmController.create)
router.post('/film/genre', filmController.getFilmGenre)
router.get('/films', authMiddlewares, filmController.getAll)
router.post('/films/search', filmController.searchFilm)
router.put('/film', authMiddlewares, filmController.getOne)
router.get('/profileFilm/:id?', filmController.findFilmId)
router.put('/updateFilm',[upload.single('picture'), authMiddlewares], filmController.update)
router.put('/film/rating',authMiddlewares, filmController.getRating)
router.delete('/film/:name', filmController.delete)


module.exports = router