"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/Community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { ConnenctToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { fetchUser, getuserintrests } from "./user.action";

  interface params {
    name : string;
    username:string;
    bio:string;
    slugurl:string;
    image:string;
    createdBy:string;
    members:string;
    intivitionasmembers?:string[];
    intivitionasadmins?:string[];
  }
    export async function createcommunity({
      name,
      username,
      bio,
      slugurl,
      image,
      createdBy,
      members,
      intivitionasmembers,
      intivitionasadmins
    }:params
    ): Promise<void>{

  try {
      ConnenctToDB();
      const user = await User.findById(createdBy);
          if (!user) {
            throw new Error("User not found"); // Handle the case if the user with the id is not found
          }
          const newCommunity = new Community({
                  name,
                  username,
                  image,
                  bio,
                  slugurl,
                  intivitionasmembers,
                  intivitionasadmins,
                  createdBy: user._id,
                  members: user._id // Use the mongoose ID of the user
                });
            
                const createdCommunity = await newCommunity.save();
            
                // Update User model
                user.communities.push(createdCommunity._id);
                await user.save();
            
                // return createdCommunity;
  } catch (error) {
    
    console.error("Error creating community:", error);
    throw error;
  }
}


export async function fetchCommunityDetails(id: string) {
  try {
    ConnenctToDB();

    const communityDetails = await Community.findById(id).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "admins",
        model: User,
        select: "name username image _id id",
      }
    ]);
    return communityDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    ConnenctToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    ConnenctToDB();

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string,
  path?:string
)
 {

  if(path === undefined){
    throw new Error("Path is required")
  }
  try {
    ConnenctToDB();

    // Find the community by its unique id
    const community = await Community.findById( communityId );

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findById( memberId );

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.members.includes(memberId)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community
    community.members.push(memberId);
    community.intivitionasmembers.pull(memberId);
    await community.save();

    // Add the community's _id to the communities array in the user
    user.communities.push(communityId);
    await user.save();
    revalidatePath(path)
    // return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}
export async function addMemberToCommunityasadmin(
  communityId: string,
  memberId: string,
  path?:string,
) 
{

  if(path === undefined){
    throw new Error("Path is required")
  }
  try {
    ConnenctToDB();

    // Find the community by its unique id
    const community = await Community.findById( communityId );

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findById( memberId );

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.admins.includes(memberId)) {
      throw new Error("User is already a member of the community");
    }
   
    // Add the user's _id to the members array in the community
    community.admins.push(memberId);
    community.members.push(memberId);
    community.intivitionasadmins.pull(memberId);
    await community.save();

    // Add the community's _id to the communities array in the user
    user.communities.push(communityId);
    await user.save();
    revalidatePath(path)
    // return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function changemembertoadmin(communityId:string,userId:string,path?:string){
  if(path === undefined){
    throw new Error("Path is required")
  }
  try {
    ConnenctToDB();
    const community = await Community.findById(communityId);
    
    if (!community) {
      throw new Error("Community not found");
    }

    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    if (community.admins.includes(userId)) {
      throw new Error("User is already an admin");
    }
    community.admins.push(userId);
    await community.save();
    revalidatePath(path)
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw error;
  }
}
export async function changeadmintomember(communityId:string,userId:string,path?:string){
  if(path === undefined){
    throw new Error("Path is required")
  }
  try {
    ConnenctToDB();
    const community = await Community.findById(communityId);
    
    if (!community) {
      throw new Error("Community not found");
    }

    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    // }
    }
    // if (community.members.includes(userId)) {
    //   throw new Error("User is already an member");
    // }
    community.admins.pull(userId);
    await community.save();
    revalidatePath(path)
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw error;
  }
}
export async function removeUserFromCommunity(
  userId: string,
  communityId: string,
) {
  try {
    ConnenctToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findById(
      communityId
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    // Remove the user's _id from the members array in the community
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // Remove the community's _id from the communities array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );
   
    return { success: true };
    
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string,
  bio:string,
  slugurl:string,
  path:string,
  intivitionasmembers?:string[],
  intivitionasadmins?:string[],
  
) {
  try {
    ConnenctToDB();

    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findByIdAndUpdate(communityId, {
      name,
      username,
      image,
      bio,
      slugurl,
      intivitionasmembers,
      intivitionasadmins,
      path
    });

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }
    revalidatePath(path);
    // return updatedCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    ConnenctToDB();

    // Find the community by its ID and delete it
    const deletedCommunity = await Community.findByIdAndDelete(communityId);

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}
export async function requestJoinToCommunity(communityId: string, userId: string) {
  try {
    ConnenctToDB(); // تصحيح الخطأ الإملائي هنا

    // البحث عن المجتمع بواسطة الـ ID وجلب الحقل createdBy
    const community = await Community.findById( communityId ).populate({
      path: 'createdBy',
      model: 'User'
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // البحث عن المستخدم بواسطة الـ ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // التحقق إذا كان المستخدم قد طلب الانضمام إلى المجتمع مسبقاً
    if (community.requestedjoin && community.requestedjoin.includes(userId)) {
      throw new Error("User has already requested to join the community");
    }

    // التحقق إذا كان المستخدم عضواً في المجتمع
    if (community.members.includes(userId)) {
      throw new Error("User is already a member of the community");
    }

    // إضافة ID المستخدم إلى مصفوفة requestedJoin في المجتمع
    community.requestedjoin.push(userId);

    // إضافة ID المستخدم إلى حقل requests في كائن createdBy
    if (!community.createdBy.requests) {
      community.createdBy.requests = []; // إنشاء الحقل إذا لم يكن موجوداً
    }
    community.createdBy.requests.push( community._id );

    // حفظ التغييرات
    await community.save();
    await community.createdBy.save();
  } catch (error) {
    console.error("Error requesting to join community: ", error);
    throw error;
  }
}

export async function addnotificationcommunitiesjoin(userId:string){

  try {
    ConnenctToDB();
    const community = await User.findById(userId).
    populate({
      path:"requests",
      model: Community,
      options: { sort: { 'createdAt': -1 } },
      select : "username name image id"
    })
    return community;
  } catch (error) {
    console.error("Error requesting to join community: ", error);
    throw error;
}
}


export async function gettrequstedjoin(communityId:string){

  try {
      ConnenctToDB();

      const request = await Community.findById(communityId).
      populate({
        path:"requestedjoin",
        model:User,
      })
      return request;
  } catch (error) {
    console.error("Error fetching requestedjoins in community: ", error);
    throw error;
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

export async function getusercommunitiescount(userId: string,path:string) {
  try {
    ConnenctToDB(); // Please ensure this is correctly spelled as ConnectToDB()

    const user = await User.findOne({id:userId})
      .populate({
        path: "communities",
        model: Community,
        select: "_id", // Only select the community ID
      });
      const communityCount = user.communities.length;

      // Revalidate the path using the community count
      revalidatePath(path);
  
      return { communityCount };
     // This will return an array of community IDs
  } catch (error) {
    console.error("Error fetching user communities: ", error);
    throw error;
  }
}


export async function fetchsuggestedcommunities({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
  
}: {
  userId:string
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
  
}){
  interface CommunityQuery {
    $or?: Array<{
      name?: { $regex?: RegExp };
      username?: { $regex?: RegExp };
      bio?: { $regex?: RegExp };
      slugurl?: { $regex?: RegExp };
      _id?: { $in?: string[] };
    }>;
    $and?: Array<{
      _id?: { $nin?: string[] };
      $or?: Array<{
        name?: { $regex?: RegExp };
        username?: { $regex?: RegExp };
        bio?: { $regex?: RegExp };
        slugurl?: { $regex?: RegExp };
      }>;
    }>;
  }
  try {
    ConnenctToDB();
    const user = await fetchUser(userId)
    const userintrests = await getuserintrests(user._id)
    const userintrestname = userintrests.map((item:any) => item.name);

    const skipAmount = (pageNumber - 1) * pageSize;
    const interestsRegex = new RegExp(userintrestname.join('|'), 'i');

    const excludedCommunities = await Community.find({
      $or: [
        { members: user._id},
        { createdBy: user._id },
      ]
    }).select('_id');
    const excludedCommunityIds = excludedCommunities.map(community => community._id);
    let query: CommunityQuery = {
      $and: [
        { _id: { $nin: excludedCommunityIds } },
      ],
    };

    if (userintrestname.length > 0) {
      query.$and??= [];
      query?.$and.push({
        $or: [
          { name: { $regex: interestsRegex } },
          { username: { $regex: interestsRegex } },
          { bio: { $regex: interestsRegex } },
          { slugurl: { $regex: interestsRegex } },
        ],
      });
      const postsWithInterests = await Thread.find({ text: { $regex: interestsRegex } }).select('community');
      const communityIds = postsWithInterests.map(post => post.community);
    
    if (communityIds.length > 0) {
      query.$or = [{ _id: { $in: communityIds } }];
    }
  }
    const matchingCommunitiesCount = await Community.countDocuments(query);
    console.log(matchingCommunitiesCount)
      if(matchingCommunitiesCount === 0){
        query = {
          $and: [
            { _id: { $nin: excludedCommunityIds } },
             
          ],
        };
      }
      const sortOptions = { createdAt: sortBy };
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    const totalCommunitiesCount = await Community.countDocuments(query);
    const communities = await communitiesQuery.exec();
    const isNext = totalCommunitiesCount > skipAmount + communities.length;
      // console.log(communities)
    return { communities, isNext };
    }
   catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}
