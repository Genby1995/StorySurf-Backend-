const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    //Required
    authorId:{
        type: String,
        require: true,
    },
    title:  {
        type: String,
        require: true,
        min: 1,
        max: 50,
        default: "",
    },
    body: {
        type: Array,
        default: [],
    },
    //Calculated
    likes: {
        type: Array,
        default: [],
    },
    dislikes: {
        type: Array,
        default: [],
    },
},
{timestamps: true},
);

module.exports = mongoose.model("Post", PostSchema)