import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slugurl: {
    type: String,
  },
  createdAt : {
    type : Date,
    default : Date.now
   },   
  image: String,
  bio: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  requestedjoin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
    intivitionasmembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  ],
  intivitionasadmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
],
admins: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
});

const Community =
  mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;