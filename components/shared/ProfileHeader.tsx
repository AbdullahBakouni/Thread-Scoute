import Image from "next/image";
import Intrest from "../forms/Intrest";
import CreateThreadButton from "./CreateThreadButton";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.action";
import SettingCommunity from "./SettingCommunity";
import Link from "next/link";
import EditCommunity from "../forms/EditCommunity";

interface props{
    accountId : string;
    authuserInfo : string;
    imgUrl : string;
    name: string;
    username : string;
    bio : string;
    type: string;
    members?: {
      id:string;
      name:string;
      image: string;
    }[];
    commid?:string;
    admins?: {
      id:string;
      image: string;
    }[];
    iscreator?:boolean;
    isadmin?:boolean;
    slugurl?:string;
}
const ProfileHeader = async ({
    accountId,
    authuserInfo,
    imgUrl,
    name,
    username,
    bio,
    type,
    members,
    commid,
    admins,
    iscreator,
    isadmin,
    slugurl
    } : props) => {
      const isMember = members?.some(member => member.id === authuserInfo);
      const user = await currentUser();
      const userInfo = await fetchUser(user?.id || "");
        const data = {
          userId : userInfo._id.toString()
        }
            // console.log(members)
            // console.log(admins)
        const isAnyMemberAlsoAdmin = members?.some(member => 
          admins?.some(admin => admin.id === member.id)
        );
        
  return (  
    <div className="flex flex-col w-full justify-start">
        <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
                    <div className="h-20 w-20 object-cover relative">
                        <Image 
                        src={imgUrl}
                        alt="profile photo"
                        fill
                        className="object-cover rounded-full shadow-2xl"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>
                    </div>
                </div>
                <div className="flex justify-center gap-4 items-center">
                <div>
                {accountId === authuserInfo && type !== "Community" && (
          <Link href='/profile/edit'>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />

              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>
        )}
                </div>
                
              <div>
              {accountId && accountId === authuserInfo && type === "User" &&(
                <>
             <Intrest userId = { authuserInfo}/>

                </>
      )}
            </div>
            </div>
            <div className={`flex gap-3 justify-center items-center ${type === "User" ||!isMember? "hidden" : ""}`}>
            {type !== "User" && isMember  &&(
            <>
              <CreateThreadButton communityid = {commid? commid : ""} userId = {data.userId}/>
            </>
            )}
            {type !== "User" && iscreator &&(
            <>
               <SettingCommunity Memberss = {JSON.parse(JSON.stringify(members))} communityid = {commid} admins = {JSON.parse(JSON.stringify(admins))} />
            </>
            )}
             {type !== "User" && iscreator &&(
            <>
            <EditCommunity 
            communityId = {commid? commid : ""}
             userId = {data.userId}
             communityname = {name}
             communityusername = {username}
             communitybio = {bio}
             communityimage = {imgUrl}
             slugUrl = {slugurl? slugurl : ""}
             />
          </>
            )}
            </div>
    </div>

              
        <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
        
        <div  className="mt-12 h-0.5 w-full bg-dark-3"/>
    </div>
  )
}

export default ProfileHeader
