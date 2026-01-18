const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const submissionsSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problem',
        required:true,
        index:true
    },
    code:{
        type:String,
        required:true,
        index:true

    },
    language:{
        type:String,
        required:true,
        enum:['javascript','c++','java']
    },
    status:{
        type:String,
        enum:['pending','accepted','wrong','error'],
        default:'pending'
    },
    runtime:{
type:Number,
default:0
    },
    memory:{
        type:Number,
        default:0
    },
    errorMessage:{
        type:String,
        default:''
    },
    testCasesPassed:{
        type:Number,
        default:0
    },

testCasesTotal:{
    type:Number,
    default:0
}
},{
    timestamps:true
});
const Submission=mongoose.model('submission',submissionsSchema);
module.exports=Submission;
