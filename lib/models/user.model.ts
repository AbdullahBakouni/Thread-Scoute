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
    ]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
//for the fisrt time mongoose.models.user doent exists but mongoose.model the be exists the next we call it mongoose.models.user will exists

export default User;