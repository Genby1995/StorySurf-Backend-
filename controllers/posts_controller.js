const ApiError = require("../exeptions/api_error");
const tokenService = require("../service/token_service")
const Post = require("../models/Post_model");
const User = require("../models/User_model");


class PostsController {

    async likePost(req, res, next) {
        try {
            const post = await Post.findById(req.params.id);
            const user = await User.findById(post.authorId);
            const postId = post.id;

            if (!post) {
                return res.status(404).json("Post has not been found")
            }
            if (post.dislikes.includes(req.body.userId)) {
                await post.updateOne({ $pull: { dislikes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": 1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Your dislike has been removed",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            } else if (post.likes.includes(req.body.userId)) {
                await post.updateOne({ $pull: { likes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": -1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Your like has been removed",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            } else {
                await post.updateOne({ $addToSet: { likes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": 1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Post has been liked",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    }

    async dislikePost(req, res, next) {
        try {
            const post = await Post.findById(req.params.id);
            const user = await User.findById(post.authorId);
            const postId = post.id;

            if (!post) {
                return res.status(404).json("Post has not been found")
            }
            if (post.likes.includes(req.body.userId)) {
                await post.updateOne({ $pull: { likes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": -1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Your like has been removed",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            } else if (post.dislikes.includes(req.body.userId)) {
                await post.updateOne({ $pull: { dislikes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": 1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Your dislike has been removed ",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            } else {
                await post.updateOne({ $addToSet: { dislikes: req.body.userId } });
                await user.updateOne({ $inc: { "raiting": -1 } });
                const updatedPost = await Post.findById(req.params.id);
                return res.status(200).json({
                    message: "Post has been disliked",
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes
                })
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    }

    async publishPost(req, res, next) {
        const authorId = req.body.authorId
        const title = req.body.title
        let postBody = req.body.postBody
        const newPost = new Post({
            authorId: authorId,
            title: title,
            body: postBody,
        });
        try {
            const user = await User.findById(authorId);
            if (!user) {
                return res.status(404).json("Author's ID not found")
            }
            const savedPost = await newPost.save()
            await user.updateOne({ $addToSet: { myPosts: savedPost.id } });
            console.log("Post has been published");
            return res.status(200).json({ message: "Post has been published", post: savedPost })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    async deletePost(req, res, next) {
        const targetPostId = req.params.id
        try {
            const post = await Post.findById(targetPostId);
            if (!post) {
                return res.status(404).json("Post has not been found")
            }
            //Getting editor's ID from Token
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader.split(" ")[1];
            const editorUserId = tokenService.validateAccessToken(accessToken).id
            const targetAuthorUserId = post.authorId

            if (targetAuthorUserId != editorUserId) {
                throw ApiError.NotAllowed("You can delete only your posts");
            } else {
                await Post.findById(targetPostId).deleteOne().exec()
                await User.updateOne({ _id: targetAuthorUserId }, { $pull: { myPosts: targetPostId } }).exec()
                return res.status(200).json({ message: "Post has been deleted" })
            }
        } catch (err) {
            return res.status(500).json(err)
        }

    }

    async getPosts(req, res, next) {

        const { lastPostDate, lastPostRaiting, authorsIds, postsIds } = req.body

        // Setting parameters {createdOnBefore, raitingBelow, authorsIds} for FIND()
        const createdOnBefore = (lastPostDate && typeof +lastPostDate == "number")
            ? new Date(+req.body.lastPostDate)
            : new Date(1000 * 60 * 60 * 24 * 365 * 900)

        const raitingBelow = (lastPostRaiting && typeof +lastPostRaiting == "number")
            ? lastPostRaiting
            : null

        const authors_Ids = (authorsIds instanceof Array && authorsIds.length > 0)
            ? authorsIds
            : null

        const posts_Ids = (postsIds instanceof Array && postsIds.length > 0)
            ? postsIds
            : null

        try {
            let posts = await Post.find()

            if (authors_Ids) {
                posts = posts.filter((item) => authorsIds.includes(item.authorId))
            }

            if (posts_Ids) {
                posts = posts.filter((item) => postsIds.includes(item.id))
            }

            if (raitingBelow && createdOnBefore) {
                posts = posts
                    .filter((item) => {
                        return (
                            (+item.likes.length - +item.dislikes.length) < raitingBelow
                        ) || (
                                ((+item.likes.length - +item.dislikes.length) == raitingBelow)
                                && (item.createdAt < createdOnBefore)
                            )
                    })
                    .sort((a, b) => {
                        return (
                            (+b.likes.length - +b.dislikes.length) - (+a.likes.length - +a.dislikes.length)
                        ) || (+b.createdAt - +a.createdAt)
                    })

            } else if (createdOnBefore) {
                posts = posts
                    .filter((item) => item.createdAt < createdOnBefore)
                    .sort((a, b) => +b.createdAt - +a.createdAt)
            }

            // let result = posts.map((item) => { return { raiting: (+item.likes.length - +item.dislikes.length), createdAt: item.createdAt } })
            let result = posts.slice(0, 7)
            if (!result) {
                return res.status(404).json("Post has not been found")
            } else if (result.length < 1) {
                return res.status(204).json("No content left")
            } else {
                return res.status(200).json(result);
            }
        } catch (err) {
            return res.status(500).json("Server error");
        }
    }
}

module.exports = new PostsController();