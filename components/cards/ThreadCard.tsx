
import Image from "next/image";
import Link from "next/link";
import LikeButton from "../shared/LikeButton";
import ShareButton from "../shared/ShareButton";
import { Button } from "../ui/button";
import { useRouter } from 'next/router'
import { fetchUser, showless, showmore } from "@/lib/actions/user.action";
import FollowBlockCard from "./FollowBlockCard";
import { currentUser } from "@clerk/nextjs";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
interface props {
    id: string;
    currentuserId: string;
    parentId: string | null;
    content: string;
    author: {
      name: string;
      image: string;
      id: string;
      _id?:string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    comments: {
      author: {
        image: string;
      };
    }[];
    iscomment?: boolean;
    likes? : number;
    shares? : number;
    tags?:[string];
    isHomePage?: boolean
  }

    const ThreadCard = async ({
        id,
        currentuserId,
        parentId,
        content,
        author,
        community,
        createdAt,
        comments,
        likes,
        iscomment,
        isHomePage,
        shares,
        tags
    }:props) => { 
      const user = await currentUser();
      if(!user) return null;
      const userInfo = await fetchUser(user?.id || "");
      const data = {
        threadId :id.toString(),
        userId : userInfo?._id.toString()
      };
     
    return (
      <article className={`flex flex-col w-full  rounded-xl  ${iscomment ? 
            "px-0 xs:px-7" : "bg-dark-2 p-7"}`}>
        <div className="flex items-start justify-between">
            <div className="flex flex-1 w-full flex-row gap-4">
                <div className="flex flex-col items-center">
                    <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
                        <Image 
                        src={author.image}
                        alt="profile photo"
                        fill
                        className="cursor-pointer rounded-full"
                        />
                    </Link>
                    <div className="thread-card_bar" />
                </div>

                <div className={`${iscomment && "mb-10"} flex w-full flex-col`}>
                <Link href={`/profile/${author.id}`} className="w-fit ">
                    <h4 className="text-light-1 text-base-semibold cursor-pointer">{author.name}</h4>
                </Link>
                    <div className="flex justify-between items-center">
                    <div>
                    <p className="mt-2 text-small-regular text-light-2">{content}</p>
                    </div>
                    <div className="text-gray-1">
                          {tags && tags.map((tag) => (
                            <span key={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                    </div>
                <div className="flex flex-col mt-5 gap-3">
                    <div className="flex gap-3.5 justify-between">

                        <div className="flex gap-3">
                        <LikeButton  data = {data} initialLikes={likes || 0}/>
                        <Link href={`/thread/${id}`}>
                        <Image 
                        src="/assets/reply.svg"
                        alt="reply"
                        width={24}
                        height={24}
                        className="cursor-pointer object-contain"
                        />
                        </Link>
                        <ShareButton postId = {data.threadId} currentUser = {currentuserId.toString()}/>
                        </div>
                        <div className=" flex gap-2 text-base-medium text-gray-1">
                         Likes.{likes}  shares.{shares}
                        </div>
                    </div>
                    {iscomment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
                </div>
           </div>
        </div>
        
      </div>
      {!iscomment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
         {isHomePage && (
      <>
    {comments.slice(0, 2).map((comment, index) => (
      <Image
        key={index}
        src={comment.author.image}
        alt={`user_${index}`}
        width={24}
        height={24}
        className={`${index!== 0 && "-ml-5"} rounded-full object-cover`}
      />
    ))}
    </>
    )}
         

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}
             {!iscomment && community && (
                <Link
                  href={`/communities/${community.id}`}
                  className='mt-5 flex items-center'
                >
                  <p className='text-subtle-medium text-gray-1'>
                    {formatDateString(createdAt)}
                    {community && ` - ${community.name} Community`}
                  </p>

                  <Image
                    src={community.image}
                    alt={community.name}
                    width={14}
                    height={14}
                    className='ml-1 rounded-full object-cover'
                  />
                </Link>
              )} 
               {isHomePage && (
          <FollowBlockCard
            author={author._id?.toString()}
            currentuser={data.userId}
            isHomePage={isHomePage}
        />
      )}
      </article>
    )
    }

export default ThreadCard
