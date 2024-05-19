
import CommunityForm from "@/components/shared/CommunityForm"
import { currentUser } from "@clerk/nextjs"
import { fetchUser } from "@/lib/actions/user.action"
import { useRouter } from "next/router";

export default async function page(communityId:string) {
    
  const user = await currentUser();
  const userInfo = await fetchUser(user?.id || "");
  const data = {
    id:userInfo._id.toString()
  }
  console.log(data.id)
  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
        <h1 className='head-text'>Edit Your Community</h1>
        <p className='mt-3 text-base-regular text-light-2'>Make any changes</p>
        <section className='bg-dark-2 mt-9 p-10'> 
            <CommunityForm  userId= {data.id} btnTitle = "Continue" />
        </section>
   </main>
  )
}