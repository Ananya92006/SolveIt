const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter = express.Router();
const { generateUploadSignature, saveVideoMetadata, deleteVideo, getVideoByProblemId } = require("../controllers/videoSection");
const userMiddleware = require('../middleware/userMiddleware');

videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);
videoRouter.get('/problem/:problemId', userMiddleware, getVideoByProblemId);

module.exports = videoRouter;