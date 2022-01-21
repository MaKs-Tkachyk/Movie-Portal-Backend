const UserModel = require('../models/user-models')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const MailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exeptions/api-error')





class UserService {
    async registration(email, password, userName) {
        let admin = false
        const condidate = await UserModel.findOne({ email })
        const clientName = await UserModel.findOne({ userName })
        if (condidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        if (clientName) {
            throw ApiError.BadRequest(`Пользователь с  именем ${userName} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        if (userName === "Admin" || userName === "tkachykmakc@gmail.com" || userName === "chernotaValentuna") {
            admin = true
        }
        const user = await UserModel.create({ email, password: hashPassword, activationLink, userName,admin })

        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user);//id, emai, isActivate
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)



        return {
            ...tokens,
            user: userDto
        }

    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink })
        if (!user) {
            throw ApiError.BadRequest("Некоректная сылка активации")
        }
        user.isActivated = true
        await user.save()
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email })
        if (!user) {
            throw ApiError.BadRequest("Пользователь с таким email не найден")
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest("Некоректный пароль")
        }
        const userDto = new UserDto(user)

        const tokens = tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens, user: userDto
        }
    }


    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }


    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}



module.exports = new UserService()