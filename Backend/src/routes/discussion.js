const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const discussionRouter = express.Router();
const { getDiscussions, addComment, voteComment, deleteComment } = require('../controllers/discussionController');

discussionRouter.get('/:problemId', userMiddleware, getDiscussions);
discussionRouter.post('/:problemId', userMiddleware, addComment);
discussionRouter.post('/vote/:commentId', userMiddleware, voteComment);
discussionRouter.delete('/:commentId', userMiddleware, deleteComment);

module.exports = discussionRouter;
