const User = require("../models/User_model");
const router = require("express").Router();

//USER update
router.put("/:id", async (req,res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set:req.body,
            });
            res.status(200).json("Account has been updated")
        } catch(err) {
            return res.status(500).json(err);
        }

    }else{
        return res.status(403).json("You can update only your account ")
    }
})

//USER Delete
router.delete("/:id", async (req,res) => {

    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted")
        } catch(err) {
            return res.status(500).json(err);
        }

    }else{
        return res.status(403).json("You can delete only your account ")
    }
})

//USER get
router.get("/:id", async (req,res) => {

    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json("User not found")
        }
        const {password, updatedAt, ...other} = user._doc;
        return res.status(200).json(other);
    } catch(err) {
        return res.status(500).json(err);
    }
})

//Get all users


//Follow the user
router.put("/:id/follow", async (req,res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if(!user) {
                return res.status(404).json("User not found")
            }
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{followings:req.params.id}});
                return res.status(200).json("User has been followed")
            } else {
                return res.status(403).json("You already follow this user"); 
            }
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can't follow yourself");
    }
})

//Unfollow the user
router.put("/:id/unfollow", async (req,res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if(!user) {
                return res.status(404).json("User not found")
            }
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{followings:req.params.id}});
                return res.status(200).json("User has been unfollowed")
            } else {
                return res.status(403).json("You already unfollow this user"); 
            }
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can't unfollow yourself");
    }
})

module.exports = router;