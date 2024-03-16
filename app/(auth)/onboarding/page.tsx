import AccountProfile from '@/components/forms/AccountProfile'
import { currentUser } from '@clerk/nextjs'

 const page = async () => {
  const user = await currentUser();

  const userInfo = {} //come from database

  const userData = {
      id : user?.id,
      objectId : userInfo?._id,
      username : userInfo?.username || user?.username,
      name : userInfo?.name || user?.firstName || "",
      bio : userInfo?.bio || "",
      image : userInfo?.image || user?.imageUrl
  }
  return (
   <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
        <h1 className='head-text'>OnBoarding</h1>
        <p className='mt-3 text-base-regular text-light-2'>Complete Your Profile Now To Use Thread Scout</p>

        <section className='bg-dark-2 mt-9 p-10'> 
            <AccountProfile user = {userData} btnTitle = "continue" />
        </section>
   </main>
  )
}

export default page
