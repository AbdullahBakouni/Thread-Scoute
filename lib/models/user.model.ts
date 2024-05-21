import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    id:{type : String , required : true},
    username:{type : String , required : true , unique : true},
    name:{type : String , required : true},
    image:{type : String},
    bio:{type : String},
    threads : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Thread"
        }
    ],
    onboarded : {
        type : Boolean ,
        default : false
    },
    communities : [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : "Community"
        }
    ],
    LikedThreads : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Thread"
        }
    ],
    Interests : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Intrest"
        }
    ],
    SharedThreads : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Thread"
        }
    ],
    ReceiveThreads: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Thread"
        }
      ],
      IntrestedUser :  [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
      ],
    BlockUser :  [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
      ],
    followinguser : {
        type : [String],
    },
    myFollowNumber : {
        type : Number,
        default : 0
       },
       followingpeople : {
        type : Number,
        default : 0
       },
       Userwholikes : [ 
        {
        type : mongoose.Schema.Types.ObjectId,
          ref : "User"
       }
    ],
    requests : [ 
        {
        type : mongoose.Schema.Types.ObjectId,
          ref : "Community",
       },
    ],
    invitionasmember :   [ 
        {
        type : mongoose.Schema.Types.ObjectId,
          ref : "User"
       }
    ],
    invitionasadmin :   [ 
        {
        type : mongoose.Schema.Types.ObjectId,
          ref : "User"
       }
    ],

});

const User = mongoose.models.User || mongoose.model("User", userSchema);
//for the fisrt time mongoose.models.user doent exists but mongoose.model the be exists the next we call it mongoose.models.user will exists

export default User;