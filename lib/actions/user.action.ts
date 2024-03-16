"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { ConnenctToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { error } from "console";

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
  export async function insertintrest(id:string, interests:object[]) {
    ConnenctToDB();

    try {
      await  User.findOneAndUpdate({id:id},{
        Interests : interests
      }
    )
    } catch (error:any) {
      throw new Error (`Failed to add intereasts : ${error.message}`)
    }
  }
  export async function fetchUserByName(username:string){
    ConnenctToDB();
      try {
      
        return await User.findOne({username : username})   
  } catch (error:any) {
      throw new Error (`Failed to fetch users ${error}`)
  }
  }

  export async function savepostshared(currentUserId:string,postId:string){
    ConnenctToDB();
  try {
        const user  = await User.findOne({ id: currentUserId });
        const post = await Thread.findOne({ _id: postId });
        if(user && post){
          user.SharedThreads.push(post);
          post.ShareCount+=1;
          await post.save();
          await user.save();
        }
  } catch (error) {
    throw new Error (`Failed to save shaer post ${error}`)
  }
}
export async function addpostshared(receiveUserId:string,sentUserId:string,postId:string){
  
  ConnenctToDB();

  try {
    const receiveuser = await User.findOne({ id: receiveUserId });
const sentuser = await User.findOne({ id: sentUserId }).select("name");
const post = await Thread.findOne({ _id: postId });
if (receiveuser && sentuser && post) {
  console.log('sentUserId:', sentuser);
  const fromValue = sentuser.name; // get the from value from the sentuser document
  receiveuser.ReceiveThreads.push({ _id: post._id});
  await receiveuser.save();
  await sentuser.save();
}
  } catch (error:any) {
    throw new Error (`Failed to add shaer post to receiver user${error.message}`)
  }
}

export async function showmore(authorId:string,currentUserId:string){
    ConnenctToDB();
  try {
    const author = await User.findOne({id:authorId});
    const currentuser = await User.findOne({id:currentUserId});

      if(!author || !currentuser){
        throw new Error("Author not found or currentuser")
      }
       currentuser.IntrestedUser.push(authorId);
        currentuser.myFollowNumber += 1;
        author.followinguser.push(currentUserId);
        author.followingpeople += 1;
      await currentuser.save();
      await author.save();
  } catch (error:any) {
    throw new Error (`Failed follwo user${error.message}`)
    
  }
}

export async function showless(authorId:string,currentUserId:string){
  ConnenctToDB();
  try {
    const author = await User.findOne({id:authorId});
    const currentuser = await User.findOne({id:currentUserId});

    if(!author || !currentuser){
      throw new Error("Author not found or currentuser")
    }
     currentuser.BlockUser.push(authorId);
     if(currentuser.IntrestedUser.includes(authorId)){
       // Remove the blocked author from the IntrestedUser array
       currentuser.IntrestedUser = currentuser.IntrestedUser.pull(authorId);
       currentuser.myFollowNumber -= 1;
       author.followinguser.pull(currentUserId);
       author.followingpeople -= 1;
     }
    await currentuser.save();
    await author.save();
  } catch (error:any) {
    throw new Error (`Failed to block user${error.message}`)
  }
}
export async function getpostusercommentedon(userId:string){

  ConnenctToDB();
  try {
    // جلب التعليقات التي قام بها المستخدم
    const userComments = await Thread.find({ author: userId, parentId: { $ne: null } })
      .populate({
        path: 'parentId',
        model :Thread,
         // لجلب المنشور الأصلي
        populate: {
          path: 'author',
          model : User, // لجلب معلومات مؤلف المنشور الأصلي
          select: 'name image id' // اختيار الحقول المطلوبة من مؤلف المنشور
        }
      })
      .populate('author', 'name image id') // لجلب معلومات المستخدم الذي علق
      .exec();
      

    // تحويل النتائج إلى الشكل المطلوب
    const postsWithComments = userComments.map(comment => {
      const post = comment.parentId;
      return {
        originalPost: {
          id: post._id,
          content: post.text,
          author: post.author,
          parentId:post.parentId,
          community : post.community,
          createdAt: post.createdAt,
          likes: post.LikeCount,
          comments : post.children
          // أي حقول أخرى مطلوبة
        },
        commentDetails: {
          id: comment._id,
          content: comment.text,
          author: comment.author,
          createdAt: comment.createdAt,
          likes: comment.LikeCount,
          community: comment.community,
          comments: comment.children,
          parentId : comment.parentId,
          // أي حقول أخرى مطلوبة
        }
      };
    });
    return postsWithComments
  } 
 
  catch (error) {
    console.error('Error fetching user comments with original posts:', error);
    throw error;
  }
}
export async function isuserFollowing(authorId:string,currentUserId:string){

  ConnenctToDB();
  try {
    const currentUser = await User.findOne({ id: currentUserId });
    return currentUser.IntrestedUser.includes(authorId);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false; 
  }
}
export async function getuserrecievedthreads(userId:string){

  ConnenctToDB();

  try {
    const user = await User.findById(userId) // استخدم findById للبحث عن المستخدم بالـ id
    .populate({
      path: 'ReceiveThreads', // تحديد الحقل للـ populate
      populate: {
        path: 'author', // تحديد الحقل داخل recievedthreads للـ populate
        select: 'id name image' // تحديد الحقول التي تريد جلبها من الكاتب
      }
    })
    .exec();
  if (!user) {
    throw new Error('User not found');
  }

  return user.ReceiveThreads; 
  } catch (error) {
      console.error('Error fetching user recieved threads:', error);
                    throw error;
  }
}

