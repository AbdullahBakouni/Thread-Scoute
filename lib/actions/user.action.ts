"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { ConnenctToDB } from "../mongoose";
import Thread from "../models/thread.model";

interface params {
    userId : string;
    name : string,
    username : string;
    bio : string;
    image : string;
    path : string;
}

export async function updateuser ({
            userId,
            username,
            name,
            bio,
            image, 
            path
    }:params
    ) : Promise<void>{

    ConnenctToDB();

        try {
            await User.findOneAndUpdate({id:userId},
                {
                    username : username.toString(),
                    name,
                    bio,
                    image,
                    onboarded:true
                },
                {upsert : true},
                 //s a database operation that will update an existing row if a specified value already exists in a table, and insert a new row if the specified value doesn't already exis
                
                );
                if(path === "/profile/edit"){
                    revalidatePath(path);
                }
        } catch (error:any) {
            throw new Error (`Failed to update/create user : ${error.message}`)
        }
}     

export async function fetchUser (userId:string){
        try {
             ConnenctToDB();
             return await User.findOne({id : userId})   
        } catch (error:any) {
            throw new Error (`Failed to fetch users ${error}`)
        }
}

export async function fetchUserPosts(id: string) {
    try {
        ConnenctToDB();
        console.log("Database connection established.");
      // Find all threads authored by the user with the given userId
  //     const user = await User.findOne({ id: id });
  // console.log("User fetched:", user);
      const Threads =  await User.findOne({ id: id }).populate({
        path: "Threads",
        model: Thread,
        populate: 
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name image id", // Select the "name" and "_id" fields from the "User" model
            },
          },
        
      });
      // const threads = await threadsquery.exec();
      // console.log("Threads populated:", Threads);
      return Threads;
    } 
    catch (error) {
      console.error("Error fetching user threads:", error);
      throw error;
    }
  }