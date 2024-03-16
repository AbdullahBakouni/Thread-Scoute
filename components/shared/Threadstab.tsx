
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchUserPosts } from "@/lib/actions/user.action";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
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


    let result = await fetchUserPosts(accountId);

    if(!result){
      redirect("/");
    }
      //   console.log(result.Threads)
      //   console.log(accountId)
      // console.log(typeof(result))
      // console.log(typeof(result.threads))

  return (
    <section className='mt-9 flex flex-col gap-10'>
    {result.Threads.map((thread:any) => (
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
        community= {thread.community}
        createdAt={thread.createdAt}
        comments={thread.children}
      />
    ))}
  </section>
  );
}

export default Threadstab;
