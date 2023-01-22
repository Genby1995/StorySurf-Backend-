module.exports = class UserDto{
    username;
    id;

    constructor(model) {
        this.username = model.username
        this.id = model._id
        this.firstName = firstName
        this.familyName = familyName
        this.avatarImg = avatarImg
        this.coverImg = coverImg
        this.location = location
        this.isAdmin = isAdmin
        this.followers = followers
        this.followings = followings
        this.raiting = raiting
        this.myPosts = myPosts
        this.favoritePosts =favoritePosts
    }

}