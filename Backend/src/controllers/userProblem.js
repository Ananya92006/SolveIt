const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");

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
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occurred");
        }
      }
    }

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
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
    if (!id) return res.status(400).send("Missing Id");

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) return res.status(500).send("Id is not present in server");

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occurred");
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
    res.status(200).send(newProblem);
  } catch (err) {
    res.status(404).send("Error: " + err);
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
    res.status(500).send("Error while deleting: " + err);
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
    res.status(500).send("Error while fetching problem: " + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await Problem.find({}).select("_id title difficulty tags");
    if (getProblem.length == 0) return res.status(404).send("Problem is missing");
    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error while fetching problems: " + err);
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

const submittedProblem=async(req,res)=> {
  try{
    const userId=req.result._id;
    const problemId=req.params.pid;
    const ans= await Submission.find({userId,problemId});
    if(ans.length==0)
      return res.status(200).send("No Submissions Yet");
    res.status(200).send(ans);
  }
  catch(err){
    res.status(500).send("Internal Server ERROR");
  }
}


module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem
};
