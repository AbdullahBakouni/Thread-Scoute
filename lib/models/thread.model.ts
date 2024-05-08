import mongoose from "mongoose";


const threadSchema = new mongoose.Schema({
   text : {
    type : String,
    required : true
   },
   author :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
   },
   community : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Community"
   },
   createdAt : {
    type : Date,
    default : Date.now
   },       
   parentId : { // in case the threads it is a comment
    type : String
   },
   children : [//if the user add comments in a comments in the end all these are threads 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Thread"
    }
   ],
   LikeCount : {
    type : Number,
    default : 0
   },
   tags: {
    type: [String],
  },
  ShareCount : {
    type : Number,
    default : 0
   },
   sharedby : [
    {
      type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
   ],
 
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);
//for the fisrt time mongoose.models.user doent exists but mongoose.model the be exists the next we call it mongoose.models.user will exists

export default Thread;