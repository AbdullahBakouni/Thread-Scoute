import ThreadCard from "@/components/cards/ThreadCard"
import { fetchPostbyId } from "@/lib/actions/thread.action";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment" 
const page = async ({params} : {params: {id:string}}) => {

    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect("/onboarded");

    const post = await fetchPostbyId(params.id);
  return (
    <section className="relative ">
        <div>
        <ThreadCard 
            key = {post._id}
            id = {post._id}
            currentuserId = {user?.id || ""}
            parentId = {post.parentId}
            content = {post.text}
            author = {post.author}
            community = {post.community}
            createdAt = {post.createdAt}
            comments = {post.children}
        />
      </div>

      <div className="mt-7">
        <Comment 
        postId = {post.id}
        currentUserImage = {userInfo.image}
        currentUserId = {JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {post.children.map((childItem : any)=>(
             <ThreadCard 
              key = {childItem._id}
              id = {childItem._id}
              currentuserId = {childItem?.id || ""}
              parentId = {childItem.parentId}
              content = {childItem.text}
              author = {childItem.author}
              community = {childItem.community}
              createdAt = {childItem.createdAt}
              comments = {childItem.children}
              iscomment
             />
        ))}
      </div>
    </section>
  )
}

export default page
