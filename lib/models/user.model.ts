import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    id:{type : String , required : true},
    username:{type : String , required : true , unique : true},
    name:{type : String , required : true},
    image:{type : String},
    bio:{type : String},
    Threads : [
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
    Interests : {
        type : [String],
    },
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
      IntrestedUser : {
        type : [String],
    },
    BlockUser : {
        type : [String],
    },
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
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
//for the fisrt time mongoose.models.user doent exists but mongoose.model the be exists the next we call it mongoose.models.user will exists

export default User;