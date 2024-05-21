"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { ConnenctToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { error } from "console";
import mongoose, { Connection, FilterQuery, SortOrder } from "mongoose";
import Intrest from "../models/intrest";
import Community from "../models/Community.model";

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

export async function fetchUserPosts(userId: string) {
  try {
    ConnenctToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      options: { sort: { 'createdAt': -1 } },
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}
export async function insertintrest(id:string, interests:string) {
  ConnenctToDB();

  try {
    await User.findOneAndUpdate(
      { id: id },
      {
        $addToSet: { Interests: { $each: interests } }// Push the string IDs directly
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating user interests:', error);
  }
}
  export async function fetchUserByName(username:string){
    ConnenctToDB();
      try {
      
        return await User.findOne({username : username}).select("id")   
  } catch (error:any) {
      throw new Error (`Failed to fetch users ${error}`)
  }
  }

  export async function savepostshared(currentUserId:string,postId:string,path?:string){
    if(path === undefined){
      throw new Error("Path is required")
    }
  try {
    ConnenctToDB();
        const user  = await User.findOne({ id: currentUserId });
        const post = await Thread.findOne({ _id: postId });
        if(user && post){
          user.SharedThreads.push(post);
          post.ShareCount+=1;
          post.sharedby.push(user._id)
          await post.save();
          await user.save();
          revalidatePath(path)
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
  
    const author = await User.findById(authorId);
    console.log(author)
    const currentuser = await User.findById(currentUserId);
      if(!author || !currentuser){
        throw new Error("Author not found or currentuser")
      }
      if(currentuser.BlockUser.includes(authorId)){
        currentuser.BlockUser.pull(authorId);
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
    
    const author = await User.findById(authorId);
    const currentuser = await User.findById(currentUserId);

    if(!author || !currentuser){
      throw new Error("Author not found or currentuser")
    }
    
     if(currentuser.IntrestedUser.includes(authorId)){
       // Remove the blocked author from the IntrestedUser array
        currentuser.IntrestedUser.pull(authorId);
        currentuser.BlockUser.push(authorId);
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
  
  try {
    ConnenctToDB();
    const currentUser = await User.findById( currentUserId );
    return currentUser.IntrestedUser.includes(authorId);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false; 
  }
 
}
export async function revalidat(path:string){
  revalidatePath(path)
}
export async function getuserrecievedthreads(userId:string){

  ConnenctToDB();

  try {
    const user = await User.findById(userId) // استخدم findById للبحث عن المستخدم بالـ id
    .populate({
      path: 'ReceiveThreads',
      options: { sort: { 'createdAt': -1 } },
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

export async function getmostlikedfivethreads(userId:string){
  ConnenctToDB();
  try {
    return Thread.find({ author: userId})
    .sort({ LikeCount: -1 }) // ترتيب تنازلي حسب عدد الإعجابات
    .limit(5)
    .populate('author', 'name image id') // الحصول على أعلى 5 نتائج فقط
    .exec(); // تنف
  } catch (error) {
    console.error('Error fetching user recieved threads:', error);
                    throw error;
  }
}
export async function getmostsharedfivethreads(userId:string){
  ConnenctToDB();
  try {
    return Thread.find({ author: userId})
    .sort({ ShareCount: -1 }) // ترتيب تنازلي حسب عدد الإعجابات
    .limit(5)
    .populate('author', 'name image id') // الحصول على أعلى 5 نتائج فقط
    .exec(); // تنف
  } catch (error) {
    console.error('Error fetching user recieved threads:', error);
                    throw error;
  }
}

export async function getfollowingpeoplenumber(userId:string){
  ConnenctToDB();


  try {
    return User.findById(userId, 'followingpeople')
    .then(user => {
      if (!user) {
        throw new Error("No User Found");
      }
      return user.followingpeople; // إرجاع عدد الأشخاص الذين يتابعهم
    })
  } catch (error) {
    console.error('Error fetching user recieved threads:', error);
    throw error;
  }
}
export async function getfollowersusers(userId:string){

    ConnenctToDB();

    try {
      const user =  await User.findById(userId) // البحث عن المستخدم بالـ id وجلب حقل followinguser
    .populate({
      path: "followinguser",
      model : User ,
      select : "name image id bio username _id"
    }) // استخدام populate للحصول على معلومات محددة من مستخدمين يتابعهم المستخدم
    .exec();
      
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }
      return user.followinguser// إرجاع مصفوفة المستخدمين المتابعين
     // إرجاع مصفوفة المستخدمين المتابعين مع معلوماتهم
  } catch (error) {
    console.error('Error fetching following users info:', error);
    throw error;
}
}

export async function getactiveuser(userId:string){

  ConnenctToDB();
  try {
    // استخدام aggregate لتجميع وتصفية الـ ObjectId المكررة
    const aggregatedLikes = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$Userwholikes' },
      { $group: {
        _id: '$Userwholikes',
        count: { $sum: 1 }
      }},
      { $match: { count: { $gte: 5 } } },
      { $project: { _id: 1 } }
    ]);

    // استخراج الـ ObjectId المكررة من النتائج
    const frequentUserIds = aggregatedLikes.map(like => like._id);

    // استخدام populate لجلب الحقول المطلوبة للمستخدمين المكررين
    const frequentUsers = await User.find({
      '_id': { $in: frequentUserIds }
    }).select('id name image username bio');

    return frequentUsers;
  } catch (error) {
    console.error('Error finding frequent users liked by:', error);
    throw error;
  }
}

export async function getuserintrests(userId:string){

    ConnenctToDB();
    try {
    
      const user = await User.findById(userId).populate({
        path: 'Interests', 
        model: Intrest, 
        populate: {
          path: 'name', 
        }
      });
      return user.Interests; 
    } catch (error) {
     
      console.error(error);
      throw error; 
    }
}

export async function deleteuserintrest(userId : string , intrestId : string) {
  ConnenctToDB();
  try {
    // البحث عن المستخدم بناءً على userId
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // إزالة الاهتمام من القائمة
    user.Interests = user.Interests.filter((item:any) => item.toString() !== intrestId);

    // حفظ التغييرات في المستخدم
    await user.save();

    return user.Interests; // إرجاع القائمة المحدثة للاهتمامات
  } catch (error) {
    console.error(error);
    throw error; // أعد رمي الخطأ ليتم التعامل معه في مكان آخر
  }
}
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    ConnenctToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
export async function getActivity(userId: string) {
  try {
    ConnenctToDB();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}

export async function getshareactivity(userId:string) {

  try {
      ConnenctToDB(); 

      const share = await User.findById(userId)
      .populate({
        path: "ReceiveThreads",
        options: { sort: { 'createdAt': -1 } }, 
        populate: {
          path: "sharedby",
          model: User,
          select: "name image id username",
        },
      });
      return share.ReceiveThreads;
  } catch (error) {
    console.error("Error fetching recievethreads: ", error);
    throw error;
  }
}

export async function getusercommunities(userId:string){
  try {
      ConnenctToDB(); 

      const user = await User.findById(userId)
    .populate({
        path: "communities",
        model: Community,
        select: "name image id createdBy bio",
        populate: {
          path: "createdBy",
          model: User,
          select: "name image id",
        },
      });
      const communities = user.communities;
      const communityCount = communities.length;
      const communityInfo = communities.map((community:any) => ({
        name: community.name,
        image: community.image,
        id: community._id,
        bio:community.bio,
        createdBy: {
          name: community.createdBy.name,
          image: community.createdBy.image,
          id: community.createdBy._id,
        },
      }));
      return { communityCount, communityInfo };
}
catch (error) {
  console.error("Error fetching recievethreads: ", error);
  throw error;
}
}
export async function getCommunities(userId: string) {
  try {
    await ConnenctToDB(); 
    const communities = await Community.find({ createdBy: userId }).select(" name image bio");
    console.log(`Communities found: ${communities.length}`);

    return communities // This will return only the communities, not the user object
  } catch (error) {
    console.error(error);
    throw error; // It's good practice to throw the error so it can be handled by the caller
  }
}
export async function fetchUsersByUsername(usernames: string[]) {
  // تأكد من أن هذه هي الدالة الصحيحة للاتصال بقاعدة البيانات الخاصة بك

  try {
    await ConnenctToDB();
    // استخدم 'find' مع عامل '$in' للحصول على جميع المستخدمين ذوي الأسماء المستعارة المعطاة
    const users = await User.find({ username: { $in: usernames } }).select("_id");

    // إرجاع مصفوفة تحتوي على '_id' لكل مستخدم
    return users.map(user => user._id);
  } catch (error:any) {
    throw new Error(`فشل في جلب المستخدمين: ${error.message}`);
  }
}
export async function fetchuseradmin(usernames: string[],userId:string) {
  // Make sure this is the correct function to connect to your database
  
  try {
   ConnenctToDB();
   // Use 'find' with the '$in' operator to get all users with the given usernames
   const users = await User.find({ username: { $in: usernames } }).select("id username invitionasadmin");

   // Assuming 'invitationsMember' is an array in your schema where you want to push the user IDs
   for (const user of users) {
     // Check if 'invitionasmember' is undefined or not an array, and initialize it as an array if necessary
     if (!Array.isArray(user.invitionasadmin)) {
       user.invitionasadmin = [];
     }

     // Now you can safely push the userId to the 'invitionasmember' array
     user.invitionasadmin.push(userId);

     // Save the updated user document
     await user.save();
   }
   // Return the array of objects with username and userId
 } catch (error: any) {
   throw new Error(`Failed to fetch users and update invitations: ${error}`);
 }
}
export async function getInvitationsWithCommunities(userId: string) {
  try {
    await ConnenctToDB();

    // البحث في موديل Community عن السجلات التي تحتوي على userId ضمن intivitionasmembers
    const communitiesWithInvitations = await Community.find({
      intivitionasmembers: userId
    }).populate('createdBy', 'username image')
    .sort({ createdAt: -1 }); // تعديل هنا لجلب معلومات createdBy

    // إرجاع المجتمعات التي تحقق الشرط مع معلومات createdBy
    return communitiesWithInvitations;
  } catch (error) {
    console.error('Error fetching invitations and communities:', error);
    throw error;
  }
}
export async function removeintivitionasmember(userId: string,path:string) {
  try {
    await ConnenctToDB();

    // Find the community that includes the userId in intivitionasmembers
    const community = await Community.findOne({
      intivitionasmembers: userId
    });

    if (community) {
      // Remove the userId from intivitionasmembers
      await Community.updateOne(
        { _id: community._id },
        { $pull: { intivitionasmembers: userId } }
      );

      // Optionally, refetch the updated community info if needed
      const updatedCommunity = await Community.findById(community._id).populate('createdBy', 'username image');

      // Return the updated community info
      await community.save();
      revalidatePath(path);
    } else {
      // Handle the case where no community is found
      console.log('No community found with the given userId in intivitionasmembers');
      return null;
    }
  } catch (error) {
    console.error('Error updating community information:', error);
    throw error;
  }
}
export async function removeintivitionasadmin(userId: string,path:string) {
  try {
    await ConnenctToDB();

    // Find the community that includes the userId in intivitionasmembers
    const community = await Community.findOne({
      intivitionasadmins: userId
    });

    if (community) {
      // Remove the userId from intivitionasmembers
      await Community.updateOne(
        { _id: community._id },
        { $pull: { intivitionasadmins: userId } }
      );

      // Optionally, refetch the updated community info if needed
      const updatedCommunity = await Community.findById(community._id).populate('createdBy', 'username image');

      // Return the updated community info
      await community.save();
      revalidatePath(path);
    } else {
      // Handle the case where no community is found
      console.log('No community found with the given userId in intivitionasmembers');
      return null;
    }
  } catch (error) {
    console.error('Error updating community information:', error);
    throw error;
  }
}


export async function getInvitationsWithCommunitiesaddmins(userId: string) {
  try {
    await ConnenctToDB();

    // البحث في موديل Community عن السجلات التي تحتوي على userId ضمن intivitionasmembers
    const communitiesWithInvitations = await Community.find({
      intivitionasadmins: userId
    }).populate('createdBy', 'username image id')
    .sort({ createdAt: -1 }); // تعديل هنا لجلب معلومات createdBy

    // إرجاع المجتمعات التي تحقق الشرط مع معلومات createdBy
    return communitiesWithInvitations;
  } catch (error) {
    console.error('Error fetching invitations and communities:', error);
    throw error;
  }
}

export async function removeUserFromRequestedJoin(communityId: string, userId: string,path:string) {
  try {
    // Connect to the database
    ConnenctToDB();

    // Find the community by ID
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    // Remove the user ID from the requestedjoin array
    community.requestedjoin.pull(userId);

    // Save the updated community
    await community.save();
    revalidatePath(path);
  } catch (error) {
    console.error("Error removing user from requestedjoins in community: ", error);
    throw error;
  }
}
export async function getUserLikedThreads(userId: string) {
  ConnenctToDB();
  try {
    const user = await User.findById(userId).populate({
      path: 'LikedThreads', // Changed from 'Interests' to 'LikedThreads'
      model: 'Thread', // Assuming 'Thread' is the model name for LikedThreads
   // Selecting only the 'text' field from LikedThreads
    });
    return user.LikedThreads // Mapping to return only text
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getuserblockedusers(userId: string) {
  ConnenctToDB();
  try {
    const user = await User.findById(userId).populate({
      path: 'BlockUser', // Changed from 'Interests' to 'LikedThreads'
      model: 'User', // Assuming 'Thread' is the model name for LikedThreads
   // Selecting only the 'text' field from LikedThreads
    });
    return user.BlockUser // Mapping to return only text
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getuserintrestusers(userId: string) {
  ConnenctToDB();
  try {
    const user = await User.findById(userId).populate({
      path: 'IntrestedUser', // Changed from 'Interests' to 'LikedThreads'
      model: 'User', // Assuming 'Thread' is the model name for LikedThreads
   // Selecting only the 'text' field from LikedThreads
    });
    return user.IntrestedUser // Mapping to return only text
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function fetchsuggestedUsers({
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
  interface UsersQuery {
    $and: Array<{
      _id?: { $nin?: string[]; $ne?: string; };
      'threads.text'?: { $regex?: RegExp }; 
      $or?: Array<{
        bio?: { $regex?: RegExp };
        'threads.text'?: { $regex?: RegExp }; 
      }>;
    }>;
  }
  try {
      ConnenctToDB();

      const user = await fetchUser(userId)
      const userintrests = await getuserintrests(user._id)
      const userintrestname = userintrests.map((item:any) => item.name);
      const blockeduser = await getuserblockedusers(user._id);
      const skipAmount = (pageNumber - 1) * pageSize;
      const interestsRegex = new RegExp(userintrestname.join('|'), 'i');
      let query : UsersQuery = {
        $and: [
          { _id: { $nin: blockeduser } },
          { _id: { $ne: user._id } }
        ],
      };
        if(userintrestname > 0){
          query.$and.push({
            $or: [
              { bio: { $regex: interestsRegex } },
             
              { 'threads.text': { $regex: interestsRegex } }
            ]
          });
    }else {
      query = {
        $and: [
          { _id: { $nin: blockeduser } },
          { _id: { $ne: user._id } },
          { 'threads.text': { $regex: interestsRegex } }
        ],
      };
    }
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching Users:", error);
    throw error;
  }
}


