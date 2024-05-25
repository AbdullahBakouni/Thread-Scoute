import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { fetchPosts } from "@/lib/actions/thread.action";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
 
export default async function Home({
     searchParams,
   }: {
     searchParams: { [key: string]: string | undefined };
   }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  const AllPosts = await fetchPosts(user?.id || "", searchParams.page ? +searchParams.page : 1,
  30);

  const isHomePage = true;

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
                                   shares = {post.ShareCount}
                                   tags = {post.tags}
                                   isHomePage
                                   />
                                   
                              ))}
                               
                         </>
                    )} 
                </section>
                <Pagination
                    path='/'
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={AllPosts.isNext}
                    />
          </>
  )
  
}