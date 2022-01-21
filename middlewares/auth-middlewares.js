const ApiError = require('../exeptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        const autorizationHeadr = req.headers.authorization
        if (!autorizationHeadr) {
            return next(ApiError.UnauthorisedError())
        }

        const accessToken = autorizationHeadr.split(" ")[1]
        if(!accessToken){
            return next(ApiError.UnauthorisedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)
        if(!userData){
            return next(ApiError.UnauthorisedError())
        }

        req.user = userData
        next()
    }
    catch (e) {
        throw next(ApiError.UnauthorisedError())
    }
}