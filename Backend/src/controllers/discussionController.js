const Discussion = require('../models/discussion');

// GET /discussion/:problemId - Get all discussions for a problem
const getDiscussions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const discussions = await Discussion.find({ problemId, parentId: null })
      .populate('userId', 'firstName emailId')
      .sort({ createdAt: -1 });

    // Fetch replies for each top-level comment
    const withReplies = await Promise.all(
      discussions.map(async (d) => {
        const replies = await Discussion.find({ parentId: d._id })
          .populate('userId', 'firstName emailId')
          .sort({ createdAt: 1 });
        return { ...d.toObject(), replies };
      })
    );

    res.status(200).json(withReplies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch discussions: ' + err.message });
  }
};

// POST /discussion/:problemId - Add a comment or reply
const addComment = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;
    const { content, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // If parentId is provided, verify it exists and belongs to same problem
    if (parentId) {
      const parent = await Discussion.findById(parentId);
      if (!parent || parent.problemId.toString() !== problemId) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    const comment = await Discussion.create({
      problemId,
      userId,
      content: content.trim(),
      parentId: parentId || null
    });

    const populated = await Discussion.findById(comment._id)
      .populate('userId', 'firstName emailId');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment: ' + err.message });
  }
};

// POST /discussion/vote/:commentId - Toggle upvote/downvote
const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.result._id;
    const { type } = req.body; // 'upvote' or 'downvote'

    const comment = await Discussion.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userIdStr = userId.toString();

    if (type === 'upvote') {
      // Remove from downvotes if present
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== userIdStr);
      // Toggle upvote
      const idx = comment.upvotes.findIndex(id => id.toString() === userIdStr);
      if (idx > -1) {
        comment.upvotes.splice(idx, 1);
      } else {
        comment.upvotes.push(userId);
      }
    } else if (type === 'downvote') {
      // Remove from upvotes if present
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== userIdStr);
      // Toggle downvote
      const idx = comment.downvotes.findIndex(id => id.toString() === userIdStr);
      if (idx > -1) {
        comment.downvotes.splice(idx, 1);
      } else {
        comment.downvotes.push(userId);
      }
    }

    await comment.save();
    res.status(200).json({
      upvotes: comment.upvotes,
      downvotes: comment.downvotes
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to vote: ' + err.message });
  }
};

// DELETE /discussion/:commentId - Delete own comment (or admin)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.result._id;
    const isAdmin = req.result.role === 'admin';

    const comment = await Discussion.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner or admin can delete
    if (comment.userId.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete all replies too
    await Discussion.deleteMany({ parentId: commentId });
    await Discussion.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment: ' + err.message });
  }
};

module.exports = { getDiscussions, addComment, voteComment, deleteComment };
