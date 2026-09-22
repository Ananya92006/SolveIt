const express=require('express');
const adminMiddleware=require("../middleware/adminMiddleware");

const problemRouter=express.Router();
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,seedProblems,solvedAllProblembyUser,submittedProblem,toggleBookmark,getBookmarks,saveNote,getNote}=require("../controllers/userProblem");
const userMiddleware=require("../middleware/userMiddleware");

//Create a problem
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.post("/seed",adminMiddleware,seedProblems);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);

problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);

// Bookmark routes
problemRouter.post("/bookmark/toggle", userMiddleware, toggleBookmark);
problemRouter.get("/bookmark/list", userMiddleware, getBookmarks);

// Notes routes
problemRouter.post("/note/save", userMiddleware, saveNote);
problemRouter.get("/note/get/:pid", userMiddleware, getNote);

module.exports=problemRouter;