const router = require("express").Router();
const Post = require("../models/Post_model");
const User = require("../models/User_model");
const jwt = require('jsonwebtoken')


router.get("/", (req, res) => {
    console.log("post page")
})
//POST create
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const user = await User.findById(req.body.authorId);
        if (!user) {
            return res.status(404).json("Author's ID not found")
        }
        const savedPost = await newPost.save()
        return res.status(200).json("Post has been published")
    } catch (err) {
        return res.status(500).json(err)
    }
})
//POST update
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post has not been found")
        }
        if (post.authorId === req.body.authorId) {
            await post.updateOne({ $set: req.body });
            return res.status(200).json("Post has been updated")
        } else {
            return res.status(403).json("You can update only your post")
        }
    } catch (err) {
        return res.status(500).json(err);
    }
})

//POST delete
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post has not been found")
        }
        if (post.authorId === req.body.authorId) {
            await post.deleteOne();
            return res.status(200).json("Post has been deleted")
        } else {
            return res.status(403).json("You can deleted only your post")
        }
    } catch (err) {
        return res.status(500).json(err);
    }
})


//POST like
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post has not been found")
        }
        if (post.dislikes.includes(req.body.userId)) {
            await post.updateOne({ $pull: { dislikes: req.body.userId } });
            return res.status(200).json("Your dislike has been removed")
        } else if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            return res.status(200).json("Post has been liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            return res.status(200).json("Your like has been removed")
        }

    } catch (err) {
        return res.status(500).json(err);
    }
})

//POST dislike
router.put("/:id/dislike", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post has not been found")
        }
        if (post.likes.includes(req.body.userId)) {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            return res.status(200).json("Your like has been removed")
        } else if (!post.dislikes.includes(req.body.userId)) {
            await post.updateOne({ $push: { dislikes: req.body.userId } });
            return res.status(200).json("Post has been disliked")
        } else {
            await post.updateOne({ $pull: { dislikes: req.body.userId } });
            return res.status(200).json("Your dislike has been removed")
        }
    } catch (err) {
        return res.status(500).json(err);
    }
})

//POST get 1 post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post has not been found")
        }
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
});

//POST get 5 fresh posts after "lastPostDate"
router.get("/fresh/:lastPostDate", async (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in! (no access token)")

    jwt.verify(token, "secretkey", async (err, userId) => {
        if (err) return res.status(403).json("Token is not valid!");

        if (!isNaN(+req.params.lastPostDate)) {
            const createdOnBefore = new Date(+req.params.lastPostDate)
            try {
                const posts = await Post.find({ createdAt: { $lt: createdOnBefore } })
                    .sort({ createdAt: -1 })
                    .limit(5);
                if (!posts) {
                    return res.status(404).json("Post has not been found")
                }
                return res.status(200).json(posts);
            } catch (err) {
                return res.status(500).json(err);
            }

        } else {
            console.log("Ушли в элсе")
            try {
                const posts = await Post.find()
                    .sort({ createdAt: -1 })
                    .limit(5);
                if (!posts) {
                    return res.status(404).json("Post has not been found")
                }
                return res.status(200).json(posts);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })
});

// //POST get 5 freshest posts
// router.get("/fresh/", async (req, res) => {
//     console.log("Ушли в элсе")
//     try {
//         const posts = await Post.find()
//             .sort({ createdAt: -1 })
//             .limit(5);
//         if (!posts) {
//             return res.status(404).json("Posts have not been found")
//         }
//         return res.status(200).json(posts);
//     } catch (err) {
//         return res.status(500).json(err);
//     }
// });


module.exports = router;