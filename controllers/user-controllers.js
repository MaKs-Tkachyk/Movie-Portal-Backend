const { validationResult } = require("express-validator")
const userService = require("../service/user-service")
const ApiError = require('../exeptions/api-error')




class UserController {

    async registration(req, res, next) {
        try {
            console.log(req.body)
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()))
            }

            const { email, password, userName } = req.body
            const userData = await userService.registration(email, password, userName)

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

            return res.json(userData)
        }
        catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)
        }
        catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        }
        catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async active(req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        }
        catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = refreshToken ? refreshToken : req.body.token
            const userData = await userService.refresh(token);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async getUsers(req, res, next) {
        try {

            const users = await userService.getAllUsers()
            return res.json(users)
        }
        catch (e) {
            res.status(400).json({ message: e.message })
        }
    }



}


module.exports = new UserController()