const dotenv = require("dotenv").config();;
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index");
const multer = require("multer");
const errorMiddleware = require("./middlewares/error_middleware");

const PORT = process.env.PORT || 8800;
const app = express();

//middleware
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true}));
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
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





// app.use(helmet());
// app.use(morgan("common"));

// app.use("/api/users", userRoute);
// app.use("/api/auth", authRoute);
// app.use("/api/posts", postsRoute);