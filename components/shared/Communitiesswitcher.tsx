"use client"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect, useRouter } from "next/navigation"
import { getusercommunities } from "@/lib/actions/user.action"
import { useState } from "react"
interface item {
  _id:string;
  name:string;
  image:string;
  bio:string
}
interface props {
  datauser : {
    userId:string;
    username:string;
    userimage:string;
  },
  commdata : item[];
  
}
export default  function Communitiesswitcher({datauser,commdata}:props) {
  const router = useRouter();
  const [userData, setUserData] = useState(datauser);
  const mongoose = require('mongoose');

  const handleSelectComm = (community:item) => {
    setUserData({
       // تحديث الحالة ببيانات الـ community المختار
       userId:community._id,
      userimage: community.image,
      username: community.name
    });
  };
  const handleResetUserData = () => {
    setUserData(datauser);
  };

  const handleNavigation = (path:string) => {
    // Navigate to the specified path
    router.push(path);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 rounded-md bg-dark-2 px-3 py-2 hover:bg-dark-3 dark:bg-gray-800 dark:hover:bg-gray-700">
          <Avatar className="h-8 w-8">
            <AvatarImage alt="userimage" src={userData.userimage} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="font-medium text-light-2">{userData.username}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Switch organization</div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-100 dark:text-gray-400" />
        </div>
      </DropdownMenuTrigger>
      <div className="mb-6">
      <DropdownMenuContent className="w-[300px] p-4 bg-dark-2">
        <div className="space-y-4 text-light-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Organizations</h3>
            <Button size="sm" variant="outline" className="bg-dark-2 text-light-1" onClick={() => handleNavigation('/createcommunities')} >
              Create new
            </Button>
          </div>
          <>
            {commdata.map((comm)=>(
              <div className="space-y-2" key={comm.name} onClick={() => handleSelectComm(comm)}>
              <Link
                className="flex items-center gap-3 rounded-md  px-3 py-2 hover:bg-dark-3 dark:bg-gray-800 dark:hover:bg-gray-700"
                href={ `/communities/${comm._id}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="@comminfo" src={comm.image} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <div className="font-medium">{comm.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{comm.bio}</div>
                </div>
              </Link>
            </div>
          ))}  
          <div className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => handleResetUserData()}>Default</div>
          </>
        </div>
      </DropdownMenuContent>
      </div>
      
    </DropdownMenu>
  )
}

function ChevronDownIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

