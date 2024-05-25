"use server";

import { revalidatePath } from "next/cache";

import { ConnenctToDB } from "../mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/Community.model";
import { fetchUser, getUserLikedThreads, getuserblockedusers, getuserintrests, getuserintrestusers } from "./user.action";
interface Conditions {
  parentId?: {
    $in: (null | undefined)[];
  };
  text?: {
    $regex?: RegExp;
    $or?: { $regex: RegExp }[];
  };
  author?: {
    $nin?: string[];
    $in?: string[];
  };
  $or?: { [key: string]: any }[];
}
export async function fetchPosts(userId:string, pageNumber = 1, pageSize = 20) {
  await ConnenctToDB(); // Assuming this function establishes the database connection

  const user = await fetchUser(userId);
  const userInterests = await getuserintrests(user._id);
  const userInterestNames = userInterests.map((item:any) => item.name);
  const likedThreadsText = await getUserLikedThreads(user._id);
  const blockedUsers = await getuserblockedusers(user._id);
  const interestedUsers = await getuserintrestusers(user._id);

  const skipAmount = (pageNumber - 1) * pageSize;
  let conditions: Conditions = {
    $or: [
      { parentId: null },
      { parentId: { $exists: false } },
    ],
  };
  let textConditions: RegExp[] = [];

  if (userInterestNames.length > 0) {
    textConditions.push(new RegExp(userInterestNames.join('|'), 'i'));
  }
  if (likedThreadsText.length > 0) {
    const likedPosts = await Thread.find({ _id: { $in: likedThreadsText } }).select('text');
    const likedWords = likedPosts.map((post) => post.text.match(/\w{6,}/g))
    .filter(match => match) // Filter out null values
    .flat();
    // Escape special characters in words
    const escapedLikedWords = likedWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escapedLikedWords.length > 0) {
      textConditions.push(new RegExp(escapedLikedWords.join('|'), 'i'));
    }
  }

  if (textConditions.length > 0) {
    const combinedRegex = new RegExp(textConditions.map(regex => regex.source).join('|'), 'i');
    conditions.text = { $regex: combinedRegex };
  }

  if (blockedUsers.length > 0) {
    conditions.author = { $nin: blockedUsers };
  }

  if (interestedUsers.length > 0) {
    conditions.author = { $in: interestedUsers };
  }
  
  // Create a query to fetch the posts
  const postsQuery = Thread.find(conditions)
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: 'author',
      model: User,
    })
    .populate({
      path: 'community',
      model: Community,
    })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image',
      },
    });

  // Count the total number of top-level posts
  const totalPostsCount = await Thread.countDocuments(conditions);
  const posts = await postsQuery.exec();
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}


interface Params {
  text: string,
  author: string,
  tags : string[],
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path,tags }: Params
) {
  try {
    ConnenctToDB();
    let communityIdObject = null;
    if (communityId) {
      communityIdObject = await Community.findById(communityId);
    }
    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject ? communityIdObject._id : null,
      tags : tags // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    ConnenctToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  ConnenctToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  ConnenctToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}


export async function addlike(postId:string, userId:string, path:string) {
    ConnenctToDB();
    try {
       
        
        // البحث عن المنشور الأصلي
        const originalPost = await Thread.findById(postId);
        if (!originalPost) {
            throw new Error("Thread not Found");
        }
        
        // البحث عن المستخدم وإضافة المنشور إلى قائمة الإعجابات
        const user = await User.findById(userId);
        const author =  await User.findById(originalPost.author)
        if (!user) {
            throw new Error("User not Found");
        }
        
        // التحقق من عدم وجود المنشور في قائمة الإعجابات للمستخدم
        const isAlreadyLiked = user.LikedThreads.includes(postId);
        
        const userwholikes = author.Userwholikes;

        if (!isAlreadyLiked) {
            // إضافة المنشور إلى قائمة الإعجابات للمستخدم
            user.LikedThreads.push(postId);
            userwholikes.push(userId);

            // حفظ التغييرات
            await user.save();
            await author.save();
            // تحديث عدد الإعجابات في المنشور
            originalPost.LikeCount += 1;
            await originalPost.save();
            
            // إعادة تحقق الصفحة
            revalidatePath(path);
        }
    } catch (error:any) {
        throw new Error(`Error adding like to the thread: ${error.message}`);
    }
}
export async function removelike(postId:string, userId:string, path:string) {
    try {
        ConnenctToDB();
        
        // البحث عن المنشور الأصلي
        const originalPost = await Thread.findById(postId);
        const author =  await User.findById(originalPost.author)
        if (!originalPost) {
            throw new Error("Thread not Found");
        }
        
        // البحث عن المستخدم وإزالة المنشور من قائمة الإعجابات
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not Found");
        } 
        const userwholikes = author.Userwholikes;
        user.LikedThreads.pull(postId);
        console.log(userwholikes)
        console.log(userId)
        userwholikes.pull(userId);
        await author.save();
        
        // تحديث عدد الإعجابات في المنشور
        originalPost.LikeCount -= 1;
        await author.save();
        await originalPost.save();
       
        // إعادة تحقق الصفحة
        revalidatePath(path);
    } catch (error:any) {
        throw new Error(`Error removing like from the thread: ${error.message}`);
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