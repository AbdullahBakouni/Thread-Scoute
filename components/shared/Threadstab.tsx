
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchUserPosts } from "@/lib/actions/user.action";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { Butterfly_Kids } from "next/font/google";
import { Button } from "../ui/button";
import DeleteThread from "../forms/DeleteThread";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
    LikeCount: number;
    ShareCount : number;
    tags : [string];
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}
interface props {
    currentUserId: string;
    accountId : string;
    accountType: string;
}

async function Threadstab ({currentUserId,accountId,accountType}:props)  {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }
  if (!result) {
    redirect("/");
  }
      //   console.log(result.Threads)
      //   console.log(accountId)
      // console.log(typeof(result))
      // console.log(typeof(result.threads))

  return (
    <section className='mt-9 flex flex-col gap-10'>
      
    {result.threads.map((thread) => (
      
      <div className="flex justify-between items-center gap-5">
      <ThreadCard
        key={thread._id}
        id={thread._id}
        currentuserId={currentUserId}
        parentId={thread.parentId}
        content={thread.text}
        author={
          accountType === "User"
            ? { name: result.name, image: result.image, id: result.id }
            : {
                name: thread.author.name,
                image: thread.author.image,
                id: thread.author.id,
              }
        }
        community={
          accountType === "Community"
            ? { name: result.name, id: result.id, image: result.image }
            : thread.community
        }
        createdAt={thread.createdAt}
        comments={thread.children}
        likes = {thread.LikeCount}
        shares={thread.ShareCount}
        tags={thread.tags}
      />
      <div>
      <DeleteThread
          threadId={JSON.stringify(thread._id)}
          currentUserId={currentUserId}
          authorId={result.id}
          parentId={thread.parentId}
          // isComment={iscomment}
        /> 
      </div>
      </div>
    ))}
  </section>
  );
}

export default Threadstab;
