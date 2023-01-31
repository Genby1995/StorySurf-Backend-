const UserModel = require("../models/User_model");
const PostModel = require("../models/Post_model")
const bcrypt = require("bcrypt")
const tokenService = require("./token_service")
const ApiError = require("../exeptions/api_error")

class UserService {
    async registertation(
        username,
        password,
        firstName,
        familyName,
    ) {
        // Check user if exist
        const candidate = await UserModel.findOne({ username });
        if (candidate) {
            throw ApiError.BadRequest("Username is already used")
        }
        // Create a new USER
        const hashPassword = await bcrypt.hash(password, 3);

        const user = await UserModel.create({
            username: username,
            password: hashPassword,
            firstName: firstName,
            familyName: familyName,
        });

        const userJSON = JSON.stringify(user);
        const userData = JSON.parse(userJSON);
        userData.password = "secret;)";

        const tokens = tokenService.generateTokens({ id: userData._id });
        await tokenService.saveToken(userData._id, tokens.refreshToken);

        return { ...tokens, user: user };
    }

    async login(username, password) {

        // Check user if exist
        const user = await UserModel.findOne({ username });
        if (!user) {
            throw ApiError.BadRequest("User with this username is not registered")
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest("Wrong password")
        }
        const userJSON = JSON.stringify(user)
        const userData = JSON.parse(userJSON)
        userData.password = "secret;)";

        const tokens = tokenService.generateTokens({ id: userData._id });
        await tokenService.saveToken(userData._id, tokens.refreshToken);
        return { ...tokens, user: user };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userId = await tokenService.validateRefreshsToken(refreshToken);
        const tokkenFromDb = await tokenService.findToken(refreshToken);
        if (!userId || !tokkenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userId.id);
        const userJSON = JSON.stringify(user)
        let userData = JSON.parse(userJSON)
        userData.password = "secret;)";

        const tokens = tokenService.generateTokens({ id: userData._id });
        await tokenService.saveToken(userData._id, tokens.refreshToken);
        return { ...tokens, user: user };
    }

    // async getAllUsers() {
    //     const users = await UserModel.find();
    //     UserModel.update({ isAdmin: false }, { followers: [] });
    //     return users;
    // }

    async getUser(userId) {
        let user = await UserModel.findById(userId);
        if (!user) {
            throw ApiError.NotFound("User not found");
        }
        user.password = "seceret;)";
        return user;
    }

    async getUsers(payload) {
        const { lastUserDate, requesterId } = payload

        const createdOnBefore = (lastUserDate && typeof +lastUserDate == "number")
            ? new Date(+lastUserDate)
            : new Date(1000 * 60 * 60 * 24 * 365 * 900)

        let users = await UserModel.find();

        if (!users) {
            throw ApiError.NotFound("Users not found");
        }

        users = users
            .filter((item) => item.id != requesterId)
            .filter((item) => item.createdAt < createdOnBefore)
            .sort((a, b) => +b.createdAt - +a.createdAt)
        users.forEach((item) => {
            item.password = "seceret;)",
                item.coverImg = "Skipped"
        })
        if (users.length < 1) {
            throw ApiError.NoContent("No Content");
        }
        let result = users.slice(0, 20)
        return result;
    }

    async getUserAvatar(userId) {
        let user = await UserModel.findById(userId);
        if (!user) {
            throw ApiError.NotFound("User not found");
        }
        return user.avatarImg;
    }

    async updateUser(payload) {
        if (payload.editorUserId != payload.targetUserId) {
            throw ApiError.NotAllowed("You can update only your profile");
        }
        await UserModel.findByIdAndUpdate(
            payload.targetUserId,
            { $set: payload.userData, }
        );
        let user = await UserModel.findById(payload.targetUserId);
        user.password = "seceret;)";
        return user;
    }

    async followUser(payload) {
        const follower = payload.follower;
        const followed = payload.followed;
        if (follower == followed) {
            throw ApiError.NotAllowed("You can't follow yourself");
        }
        const targetUser = await UserModel
            .findOneAndUpdate(
                { _id: followed },
                { $addToSet: { followers: follower } },
                { new: true })
        const currentUser = await UserModel
            .findOneAndUpdate(
                { _id: follower },
                { $addToSet: { followings: followed } },
                { new: true })
        if (!follower || !followed) {
            throw ApiError.NotFound("User not found");
        }
        return { targetUser, currentUser };
    }

    async unfollowUser(payload) {
        const follower = payload.follower;
        const followed = payload.followed;
        if (follower == followed) {
            throw ApiError.NotAllowed("You can't unfollow yourself");
        }
        const targetUser = await UserModel
            .findOneAndUpdate(
                { _id: followed },
                { $pull: { followers: follower } },
                { new: true })
        const currentUser = await UserModel
            .findOneAndUpdate(
                { _id: follower },
                { $pull: { followings: followed } },
                { new: true })
        if (!follower || !followed) {
            throw ApiError.NotFound("User not found");
        }
        return { targetUser, currentUser };
    }

    async deleteUser(payload) {
        if (payload.editorUserId != payload.targetUserId) {
            throw ApiError.NotAllowed("You can delete only your account");
        }
        await PostModel.deleteMany({ authorId: payload.targetUserId });
        await UserModel.updateMany({ $pull: { followers: payload.targetUserId } });
        await UserModel.findById(payload.targetUserId).deleteOne().exec()

        return "Account has been deleted";
    }

    async togglePostBookmark(payload) {
        const { userId, postId, todo } = payload
        if (!userId || !postId || !todo) {
            throw ApiError.BadRequest("Bad data recived")
        }
        const filter = { _id: userId };
        let update
        if (todo == "add") update = { $addToSet: { "favoritePosts": postId } };
        if (todo == "remove") update = { $pull: { "favoritePosts": postId } };
        await UserModel.findOneAndUpdate(filter, update);
        const user = await UserModel.findById(userId)
        const userBookmarks = user.favoritePosts
        console.log(userBookmarks);
        return userBookmarks;
    }
}

module.exports = new UserService();