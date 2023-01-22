const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    //Required
    username:{
        type: String,
        require: true,
        min: 3,
        max: 30,
        unique: true,
    },
    password: {
        type: String,
        require: true,
        min: 6,
        max: 30,
    },
    //Optional
    firstName:{
        type: String,
        min: 1,
        max: 30,
        default: "",
    },
    familyName:{
        type: String,
        min: 1,
        max: 30,
        default: "",
    },
    about:{
        type: String,
        default: "",
    },
    avatarImg: {
        type: String,
        default: "",
    },
    coverImg: {
        type: String,
        default: "",
    },
    // location: {
    //     type: String,
    //     min: 3,
    //     max: 100,
    //     default: "",
    // },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    //Calculated
    followers: {
        type: Array,
        default: [],
    },
    followings: {
        type: Array,
        default: [],
    },
    raiting: {
        type: Number,
        default: 0,
    },
    myPosts: {
        type: Array,
        default: [],
    },
    favoritePosts: {
        type: Array,
        default: [],
    },
    //добавить -механику рейтинга по моим постам -любимые посты


},
{timestamps: true},
);

module.exports = mongoose.model("User", UserSchema)