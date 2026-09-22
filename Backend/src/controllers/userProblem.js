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
      if (creatorId) {
        const seeded = DEFAULT_PROBLEMS.map(p => ({ ...p, problemCreator: creatorId }));
        await Problem.insertMany(seeded);
        getProblem = await Problem.find({}).select("_id title difficulty tags");
      }
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

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  seedProblems,
  solvedAllProblembyUser,
  submittedProblem
};
