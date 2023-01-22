const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
    //Required
    user:{
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    },
    refreshToken:{
        type: String,
        required: true,
    },
},
{timestamps: true},
);

module.exports = mongoose.model("Token", TokenSchema)