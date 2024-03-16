
import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Tabs,TabsList,TabsContent,TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import Threadstab from "@/components/shared/Threadstab";
const page = async ({params} : {params : {id : string}}) => {
    const user =  await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(params.id); //to fetch another user if we want to desplay her profile page not juset the user who log in

    if(!userInfo.onboarded) redirect("/onboarding");
  return (
    <section>
        <ProfileHeader 
            accountId = {userInfo.id}
            authuserInfo= {user.id}
            imgUrl = {userInfo.image}
            name = {userInfo.name}
            username = {userInfo.username}
            bio = {userInfo.bio}
        />
        <div className="mt-9">
            <Tabs defaultValue="threads" className="w-full">
                <TabsList className="tab">
                    {profileTabs.map((tab) => (
                        <TabsTrigger key={tab.label} value={tab.value} className="tab">
                            <Image 
                            src={tab.icon}
                            alt={tab.label}
                            width={24}
                            height={24}
                            className="object-contain"
                            />
                            <p className="max-sm:hidden">{tab.label}</p>

                            {tab.label === "Threads" && (
                           <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                            {userInfo?.Threads?.length}
                           </p>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {profileTabs.map((tab)=>(
                     <TabsContent key={`content-${tab.label}`} value={tab.value} className="text-light-1 w-full">
                    <Threadstab 
                    currentUserId = {user.id}
                    accountId = {userInfo.id}
                    accountType = "User"
                    />
                     </TabsContent>
                    
                ))}
            </Tabs>
        </div>
    </section>
  )
}

export default page
