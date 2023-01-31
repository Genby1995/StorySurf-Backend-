const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index");
const errorMiddleware = require("./middlewares/error_middleware");

const PORT = process.env.PORT || 8800;
const CLIENT_URLS = process.env.CLIENT_URLS;
const CLIENT_URLS_ARR = CLIENT_URLS.split(",")
console.log(CLIENT_URLS_ARR);

const app = express();

var whitelist = CLIENT_URLS_ARR

//middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(cors(
    {
        origin: function (origin, callback) {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error(origin + ' Not allowed by CORS'))
            }
        },
        credentials: true,
    }
))
app.use("/api", router);
app.use(errorMiddleware);


const start = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(
            process.env.MONGO_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            () => {
                console.log("Connected to MongoDB!")
            }
        );
        app.listen(PORT, () => {
            console.log(`Server started on PORT = ${PORT}!`)
        });
    } catch (e) {
        console.log(e);
    }
}

start()