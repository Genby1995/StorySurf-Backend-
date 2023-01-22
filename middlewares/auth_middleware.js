const ApiError = require("../exeptions/api_error")
const tokenService = require("../service/token_service")

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }
        const accessToken = authorizationHeader.split(" ")[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }
        const userId = tokenService.validateAccessToken(accessToken)
        if (!userId) {
            return next(ApiError.UnauthorizedError())
        }
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}