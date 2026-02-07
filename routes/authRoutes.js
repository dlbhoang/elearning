const express = require("express");
const authControllerModule = require("../controllers/authController.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const uploadModule = require("../middlewares/upload.js");

const authController = authControllerModule;
const upload = uploadModule;
const router = express.Router();

// Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", verifyToken, authController.profile);
router.put("/update", verifyToken, upload.single("avatar"), authController.updateProfile);
router.post('/google', authController.googleLogin);
router.get("/check-enrollment/:courseId", verifyToken, authController.checkEnrollment);

module.exports = router;
