const express=require('express');
const adminMiddleware=require("../middleware/adminMiddleware");

const problemRouter=express.Router();
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem}=require("../controllers/userProblem");
// const updateProblem=require("../controllers/userProblem")
const userMiddleware=require("../middleware/userMiddleware");

//Creste a problem
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);

problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser);
problemRouter.get("/submittedProblem",userMiddleware,submittedProblem);
//fetch
//update
//delete
module.exports=problemRouter;