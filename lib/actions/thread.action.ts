"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { ConnenctToDB } from "../mongoose"

interface params {
    text : string,
    author : string,
    communityId : string | null,
    path: string
}
export async function createThread ({text,author,communityId,path}:params) {
    try {
        ConnenctToDB();

    const createThread = await Thread.create({
        text ,
        author,
        communityId : null
    });

    //when a thread created we need to update user model

    await User.findByIdAndUpdate(author,{
        $push : {Threads : createThread._id}
    });

    revalidatePath(path);
    } 
    catch (error:any) {
        throw new Error(`failed to create thread ${error.message}`)
    }
}

export async function fetchPosts(pageNumber = 1 , pageSize = 20 ){
    //page Number => the defult page when all 20 posts are show in thos page
    // page size => the default size of posts are shown in page

    ConnenctToDB();
    //we need to calculte the numbre of posts to skips depending on the "pageNumber && pageSize"
    const skips = (pageNumber - 1) * pageSize ;
    //we need to Fetch the hight levels of posts ("the posts with no children => ("comments")")
    
    const postsQuery = Thread.find({parentId : {$in: [null,undefined]}})
    .sort({createdAt: "desc"})
    .skip(skips)
    .limit(pageSize)
    .populate({path : "author" , model : User})
    .populate({path : "children",
    populate : {
        path : "author",
        model : User,
        select : "_id name parentId image "
    } 
    });

    const totalpostscount = await Thread.countDocuments({parentId : {$in: [null,undefined]}});

    const posts = await postsQuery.exec();

    const isNext = totalpostscount > skips + posts.length;

    return {posts,isNext};
    
}   
export async function fetchPostbyId(id : string){
    ConnenctToDB();
    try {
        const post = Thread.findById(id)
        .populate({
            path : "author",
            model : User,
            select : "_id id image name"
        })
        .populate({
            path : "children",
            populate : [
                {
                    path : "author",
                    model : User,
                    select : "_id id name image parentId"
                },
                {
                    path : "children",
                    model : Thread,
                    populate : {
                        path: "author",
                        model : User,
                        select : "_id id name image parentId"
                    }
                }
            ]
        }).exec();
        return post;

    } catch (error:any) {
        throw new Error(`Faield to fetch post : ${error.message}`)
    }
}
export async function addCommentToPost(
    postId : string,
    commentText : string,
    userId: string,
    path : string
) {
    ConnenctToDB();

    try {
        //find the original post
        const OriginalPost = await Thread.findById(postId);

        if(!OriginalPost) {
            throw new Error("Thread not Found");
        }
        //creaet a new Thjread with a Comments text
        const CommentPost = new Thread({
            text : commentText,
            author : userId,
            parentId : postId
        });

        //save the new thread
        const SavedCommentPost =  await CommentPost.save();

        //update the original thread to include the new comments
        OriginalPost.children.push(SavedCommentPost._id);

        //save the original threads
        await OriginalPost.save();
        
        //revalidtae the path

        revalidatePath(path);
    } catch (error:any) {
        throw new Error(`Error adding comments to threads ${error.message}`);
    }
}
/*
If pageNumber is 1 and pageSize is 20, it means we are on the first page and we want to display 20 posts per page.
 Therefore, the number of posts to skip would be (1 - 1) * 20 = 0.
  In this case, we don't need to skip any posts since we are on the first page.
If pageNumber is 2 and pageSize is 20, 
it means we are on the second page and we want to display 20 posts per page. 
Therefore, the number of posts to skip would be (2 - 1) * 20 = 20.
 In this case, we need to skip the first 20 posts to display the posts from the second page.
*/