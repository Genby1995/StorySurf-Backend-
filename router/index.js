const Router = require("express").Router;
const userController = require("../controllers/user_controller");
const router = new Router();
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/auth_middleware");
const postsController = require("../controllers/posts_controller");
const filesController = require("../controllers/files_controller");


// AUTHORIZATION
router.post("/auth/register",
    body("username").isLength({min: 3, max: 30}),
    body("password").isLength({min: 6, max: 30}),
    body("firstName").isLength({min: 1, max: 30}),
    body("familyName").isLength({min: 1, max: 30}),
    body("location").isLength({min: 3, max: 30}),
    userController.registration,
);
router.post("/auth/login", userController.login);
router.post("/auth/logout", userController.logout);
router.get("/auth/refresh", userController.refresh);

// POSTS
router.post("/posts/add/", authMiddleware, postsController.publishPost);
router.put("/posts/like/:id", authMiddleware, postsController.likePost);
router.put("/posts/dislike/:id", authMiddleware, postsController.dislikePost);
router.delete("/posts/delete/:id", authMiddleware, postsController.deletePost);
router.post("/posts/get_posts", authMiddleware, postsController.getPosts);

// USERS
router.get("/users/get_one/:id", authMiddleware, userController.getUser);
router.get("/users/get_one_avatar/:id", authMiddleware, userController.getUserAvatar);
router.post("/users/get_many", authMiddleware, userController.getUsers);
router.put("/users/update/:id", authMiddleware, userController.updateUser);
router.delete("/users/delete/:id", authMiddleware, userController.deleteUser);
router.put("/users/follow/:id", authMiddleware, userController.followUser);
router.put("/users/unfollow/:id", authMiddleware, userController.unfollowUser);
router.post("/users/togglePostBookmark", authMiddleware, userController.togglePostBookmark);

//FILES
router.post("/files/upload", authMiddleware, filesController.upload);

module.exports = router;