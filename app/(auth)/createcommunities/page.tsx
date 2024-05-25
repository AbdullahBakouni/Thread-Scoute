
import CommunityForm from "@/components/shared/CommunityForm"
import { currentUser } from "@clerk/nextjs"
import { fetchUser } from "@/lib/actions/user.action"

export default async function page() {
  const user = await currentUser();
  const userInfo = await fetchUser(user?.id || "");
  const data = {
    id:userInfo._id.toString()
  }
 
  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
        <h1 className='head-text'>Create Community</h1>
        <section className='bg-dark-2 mt-9 p-10'> 
            <CommunityForm  userId= {data.id} btnTitle='Continue'/>
        </section>
   </main>
  )
}