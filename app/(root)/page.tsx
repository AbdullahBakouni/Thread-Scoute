import ThreadCard from "@/components/cards/ThreadCard";
import { Button } from "@/components/ui/button";
import { fetchPosts } from "@/lib/actions/thread.action";
import { currentUser } from "@clerk/nextjs";
 
export default async function Home() {
  const AllPosts = await fetchPosts(1,30);
  const user = await currentUser();
  const isHomePage = true;
//   console.log(posts)
     return (
          <>
          <h1 className="head-text text-left">Home</h1>

               <section className="mt-9 flex flex-col gap-10">
                    {AllPosts.posts.length === 0 ? (
                         <p className="no-result">No Threads Found</p>
                    ) : (
                         <>
                              {AllPosts.posts.map((post) => (
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
                                   likes = {post.LikeCount}
                                   isHomePage
                                   />
                                   
                              ))}
                               
                         </>
                    )}
               </section>
          </>
  )
  
}