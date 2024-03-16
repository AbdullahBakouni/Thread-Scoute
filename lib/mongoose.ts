import mongoose from "mongoose";

let isConnected = false;

export const ConnenctToDB  = async () =>{
    mongoose.set("strictQuery", true);

    if(!process.env.MONGODB_URL) return console.log("MONGODB_URL NOT FOUND?");
    if(isConnected) return console.log("ALREADY CONNECTED TO MONGO DB");
    
    try {
        await mongoose.connect(process.env.MONGODB_URL);
       
        isConnected  =true;
       
        console.log("Connected to MongoDb");
        
    } catch (error) {
        console.log(error);
    }

}