import { OrganizationSwitcher, SignOutButton, SignedIn, currentUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Communitiesswitcher from './Communitiesswitcher'
import { fetchUser, getCommunities, getusercommunities } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'
const Topbar = async () => {
  const user =  await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(user.id); //to fetch another user if we want to desplay her profile page not juset the user who log in
    if(!userInfo.onboarded) redirect("/onboarding");
    const usercommunities = await getCommunities(userInfo._id);
    const data = {
      userId : userInfo._id.toString(),
      username : userInfo.name,
      userimage : userInfo.image,
    }
  return (
    <nav className='topbar'>
        <Link href="/" className='flex items-center gap-4'>
              <Image 
                src="/assets/Thread.jpg"
                width={40}
                height={40}
                alt='logo'
                className='rounded-full shadow'
              />
              <p className='text-heading3-bold text-light-1 max-xs:hidden max-xl:hidden'>Thread Scout</p>
        </Link>
        <div className='flex items-center gap-1'>
              <div className='block md:hidden'>
                    <SignedIn> 
                        <SignOutButton>
                          <div className='flex cursor-pointer'>
                                <Image 
                                  src = "/assets/logout.svg"
                                  alt='logout'
                                  width={24}
                                  height={24}
                                />
                          </div>
                        </SignOutButton>
                    </SignedIn>
              </div>
               <Communitiesswitcher datauser = {data} 
                  commdata = { JSON.parse(JSON.stringify(usercommunities))}
              />
        </div>
    </nav>
  )
}

export default Topbar
