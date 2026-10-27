const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const { DEFAULT_PROBLEMS } = require("../utils/seedData");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  try {
    if (referenceSolution && Array.isArray(referenceSolution)) {
      try {
        for (const { language, completeCode } of referenceSolution) {
          const languageId = getLanguageById(language);
          if (!languageId) continue;

          const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
          }));

          const submitResult = await submitBatch(submissions);
          if (submitResult && Array.isArray(submitResult)) {
            const resultToken = submitResult.map((value) => value.token);
            await submitToken(resultToken);
          }
        }
      } catch (judgeErr) {
        console.warn("Judge0 verification skipped/failed:", judgeErr.message);
      }
    }

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).json({ message: "Problem Saved Successfully", problem: userProblem });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).send("Missing Id");

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) return res.status(500).send("Id is not present in server");

    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
    res.status(200).send(newProblem);
  } catch (err) {
    res.status(404).send("Error: " + err.message);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("Id is Missing");
    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) return res.status(404).send("Problem is missing");
    res.status(200).send("Deleted problem successfully");
  } catch (err) {
    res.status(500).send("Error while deleting: " + err.message);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("Id is Missing");
    const getProblem = await Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases startCode referenceSolution"
    );
    if (!getProblem) return res.status(404).send("Problem is missing");
    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error while fetching problem: " + err.message);
  }
};

const getAllProblem = async (req, res) => {
  try {
    let getProblem = await Problem.find({}).select("_id title difficulty tags");
    
    // Auto-seed if database has 0 problems
    if (getProblem.length === 0 && DEFAULT_PROBLEMS.length > 0) {
      const creatorId = req.result ? req.result._id : null;
      const seeded = DEFAULT_PROBLEMS.map(p => ({
        ...p,
        problemCreator: creatorId || "6688f0000000000000000000"
      }));
      await Problem.insertMany(seeded);
      getProblem = await Problem.find({}).select("_id title difficulty tags");
    }

    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error while fetching problems: " + err.message);
  }
};

const seedProblems = async (req, res) => {
  try {
    const userId = req.result._id;
    let addedCount = 0;

    for (const prob of DEFAULT_PROBLEMS) {
      const existing = await Problem.findOne({ title: prob.title });
      if (!existing) {
        await Problem.create({
          ...prob,
          problemCreator: userId
        });
        addedCount++;
      }
    }

    const totalProblems = await Problem.countDocuments();
    res.status(200).json({
      message: `Successfully seeded ${addedCount} new problems! Total problems in database: ${totalProblems}.`,
      addedCount,
      totalProblems
    });
  } catch (err) {
    res.status(500).json({ message: "Seeding failed: " + err.message });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });

    res.status(200).send(user);
  } catch (err) {
    res.status(500).send("server error");
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;
    const ans = await Submission.find({ userId, problemId });
    if (ans.length == 0)
      return res.status(200).send("No Submissions Yet");
    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("Internal Server ERROR");
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId } = req.body;
    const user = await User.findById(userId);

    const index = user.bookmarks.indexOf(problemId);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(problemId);
    }

    await user.save();
    res.status(200).json({ bookmarks: user.bookmarks, isBookmarked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle bookmark: " + err.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate("bookmarks", "_id title difficulty tags");
    res.status(200).json(user.bookmarks || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks: " + err.message });
  }
};

const saveNote = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId, content } = req.body;
    const user = await User.findById(userId);

    const existingIndex = user.notes.findIndex(n => n.problemId.toString() === problemId);
    if (existingIndex > -1) {
      user.notes[existingIndex].content = content;
      user.notes[existingIndex].updatedAt = new Date();
    } else {
      user.notes.push({ problemId, content, updatedAt: new Date() });
    }

    await user.save();
    res.status(200).json({ message: "Note saved successfully!", note: content });
  } catch (err) {
    res.status(500).json({ message: "Failed to save note: " + err.message });
  }
};

const getNote = async (req, res) => {
  try {
    const userId = req.result._id;
    const { pid } = req.params;
    const user = await User.findById(userId);
    const noteObj = user.notes.find(n => n.problemId.toString() === pid);
    res.status(200).json({ content: noteObj ? noteObj.content : "" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch note: " + err.message });
  }
};

// Get leaderboard - all users ranked by problems solved
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('firstName emailId problemSolved')
      .populate('problemSolved', 'difficulty');

    const leaderboard = users.map(u => {
      const solved = u.problemSolved || [];
      const byDiff = { easy: 0, medium: 0, hard: 0 };
      solved.forEach(p => {
        const d = p.difficulty?.toLowerCase();
        if (byDiff.hasOwnProperty(d)) byDiff[d]++;
      });
      return {
        _id: u._id,
        firstName: u.firstName,
        emailId: u.emailId,
        totalSolved: solved.length,
        easy: byDiff.easy,
        medium: byDiff.medium,
        hard: byDiff.hard,
        // Weighted score: easy=1, medium=3, hard=5
        score: byDiff.easy * 1 + byDiff.medium * 3 + byDiff.hard * 5
      };
    });

    leaderboard.sort((a, b) => b.score - a.score || b.totalSolved - a.totalSolved);

    // Add rank
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard: ' + err.message });
  }
};

// Get daily challenge - deterministic based on date
const getDailyChallenge = async (req, res) => {
  try {
    const problems = await Problem.find({}).select('_id title difficulty tags');
    if (problems.length === 0) {
      return res.status(200).json(null);
    }

    // Deterministic daily selection using date hash
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit int
    }
    const index = Math.abs(hash) % problems.length;
    const dailyProblem = problems[index];

    // Check if current user has solved it today
    let solvedToday = false;
    if (req.result) {
      const userId = req.result._id;
      const user = await User.findById(userId);
      solvedToday = user.problemSolved?.some(pid => pid.toString() === dailyProblem._id.toString()) || false;
    }

    res.status(200).json({
      problem: dailyProblem,
      solvedToday,
      date: today.toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily challenge: ' + err.message });
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  seedProblems,
  solvedAllProblembyUser,
  submittedProblem,
  toggleBookmark,
  getBookmarks,
  saveNote,
  getNote,
  getLeaderboard,
  getDailyChallenge
};
