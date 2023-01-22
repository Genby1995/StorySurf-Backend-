const router = require("express").Router();
const User = require("../models/User_model");
const jwt = require('jsonwebtoken')

//REGISTER
router.post("/register", async (req, res) => {
    try {
        // Check user if exist
        const user = await User.findOne({ username: req.body.username });
        if (user) return res.status(200).json("Username is already used")
        if (!user) {
            // Create a new USER
            const newUser = new User({
                username: req.body.username,
                password: req.body.password,
                firstName: req.body.firstName,
                familyName: req.body.familyName,
            })
            const user = await newUser.save();
            res.status(200).json("User has been created")
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json("User not found")

        const validPassword = await (req.body.password == user.password);
        if (!validPassword) return res.status(400).json("Wrong password")
        
        const userJSON = JSON.stringify(user)
        const userDATA = JSON.parse(userJSON)
        const {password, ...rest} = userDATA;
        const token = jwt.sign({ id: user._id }, "secretkey")
        
        return res
            .cookie("accessToken", token)
            .status(200)
            .json(rest);

    } catch (err) {
        return res.status(500).json(err);
    }
})

//LOGOUT
router.post("/logout", async (req, res) => {
    try {   
        return res
            .clearCookie("accessToken", {
                sameSite: "none"
            })
            .status(200)
            .json("User has been logged out");
            
    } catch (err) {
        return res.status(500).json(err);
    }
})

//REFRESH TOKEN
// router.post.length("/refresh");

module.exports = router;