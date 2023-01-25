const userService = require("../service/user_service")
const tokenService = require("../service/token_service")
const ApiError = require("../exeptions/api_error");

class UserController {
    async registration(req, res, next) {
        try {
            const {
                username,
                password,
                firstName,
                familyName,
            } = req.body;
            const userData = await userService.registertation(
                username,
                password,
                firstName,
                familyName,
            )
            res.cookie(
                "refreshToken",
                userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
            )
            console.log(`User "${userData.user.username}" registraited`)
            return res.status(200).json(userData);
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            let userData = await userService.login(username, password);
            userData.user.password = "secret;)"
            res.cookie(
                "refreshToken",
                userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
            )
            console.log(`User "${userData.user.username}" logged in`)
            return res.status(200).json(userData);
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken")
            console.log(`Some user logged out`)
            return res.status(200).json(token)
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            let userData = await userService.refresh(refreshToken)
            res.cookie(
                "refreshToken",
                userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
            )
            console.log(`User "${userData.user.username}" logged in`)
            return res.status(200).json(userData);
        } catch (e) {
            next(e)
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json(users)
        } catch (e) {
            next(e)
        }
    }

    async getUser(req, res, next) {
        try {
            const userId = req.params.id
            const user = await userService.getUser(userId);
            console.log("User information has been sent");
            return res.status(200).json(user)
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        const { lastUserDate, requesterId } = req.body
        try {
            const users = await userService.getUsers({ lastUserDate: lastUserDate, requesterId: requesterId });
            return res.status(200).json({ message: "Users information has been sent", usersData: users })
        } catch (e) {
            next(e)
        }
    }

    async getUserAvatar(req, res, next) {
        try {
            const userId = req.params.id
            const userAvatar = await userService.getUserAvatar(userId);
            return res.status(200).json(userAvatar)
        } catch (e) {
            next(e)
        }
    }

    async updateUser(req, res, next) {
        try {
            //Getting editor's ID from Token
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader.split(" ")[1];
            const editorUserId = tokenService.validateAccessToken(accessToken).id
            const targetUserId = req.params.id

            const userData = req.body
            const user = await userService.updateUser({
                editorUserId: editorUserId,
                targetUserId: targetUserId,
                userData: userData
            })
            console.log("Account has been updated");
            res.status(200).json(user)
        } catch (e) {
            next(e)
        }
    }

    async deleteUser(req, res, next) {
        try {
            //Getting editor's ID from Token
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader.split(" ")[1];
            const editorUserId = tokenService.validateAccessToken(accessToken).id
            const targetUserId = req.params.id

            const message = await userService.deleteUser({
                editorUserId: editorUserId,
                targetUserId: targetUserId,
            })
            res.status(200).json({ message: message })
        } catch (e) {
            next(e)
        }
    }

    async followUser(req, res, next) {
        const follower = req.body.followingUserId;
        const followed = req.params.id;
        try {
            const { targetUser, currentUser } = await userService.followUser({
                follower: follower,
                followed: followed,
            })
            const clientFollowings = currentUser.followings
            const targetFollowers = targetUser.followers

            return res.status(200).json({
                message: "User has been followed",
                clientFollowings: clientFollowings,
                targetFollowers: targetFollowers
            })
        } catch (e) {
            next(e)
        }
    }

    async unfollowUser(req, res, next) {
        const follower = req.body.followingUserId;
        const followed = req.params.id;
        try {
            const { targetUser, currentUser } = await userService.unfollowUser({
                follower: follower,
                followed: followed,
            })
            const clientFollowings = currentUser.followings
            const targetFollowers = targetUser.followers

            return res.status(200).json({
                message: "User has been unfollowed",
                clientFollowings: clientFollowings,
                targetFollowers: targetFollowers
            })
        } catch (e) {
            next(e)
        }
    }

    async togglePostBookmark(req, res, next) {
        const {userId, postId, todo} = req.body
        
        try {
            const userBookmarks = await userService.togglePostBookmark({
                userId: userId,
                postId: postId,
                todo: todo,
            })
            return res.status(200).json({
                message: "Post added to bookmarks",
                userBookmarks: userBookmarks,
            })

        } catch (err) {
            return res.status(500).json(err);
        }
    }

}

module.exports = new UserController();