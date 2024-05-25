"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { addMemberToCommunity } from '@/lib/actions/community.actions';
import { usePathname } from 'next/navigation';
import { removeintivitionasmember } from '@/lib/actions/user.action';
interface userinfo {
    userId: string;
  }
  
  interface communityinfo {
    communityId: string;
  username: string;
  name: string;
  slugurl: string;
  image: string;
  bio: string;
  createdBy: string;
  createdByName?: string; // Add this if you need to include the 'createdByName' property
  threads?: string[];
  members: string[];
  requestedjoin: string[];
  intivitionasmembers: string[];
  intivitionasadmins: string[];
  version: number;
  }
  interface props {
    comminfo: communityinfo[];
    userinfo: userinfo;
  }
const AcceptDeleteButton = ({comminfo,userinfo}:props) => {
  const [visibleInvites, setVisibleInvites] = useState(comminfo.map((info) => info.communityId));
  const path = usePathname();
  const handleaccept = async (communityId: string) => {
    try {
      await addMemberToCommunity(communityId, userinfo.userId,path);
      const isMember = comminfo.some((community) => community.members.includes(userinfo.userId));
    
    if (isMember) {
      // Hide the invite if the user is a member
      setVisibleInvites((prev) => prev.filter((id) => id !== communityId));
    }
      console.log('Accept action performed');
    } catch (error) {
      console.error('Error performing Accept action:', error);
    }
  };

  const handledelete = async (communityId:string) => {
    try {
      const isMember = comminfo.some((community) => community.members.includes(userinfo.userId));
      
      if (isMember === false) {
        // Hide the invite if the user is not a member
        await removeintivitionasmember(userinfo.userId,path)
        setVisibleInvites((prev) => prev.filter((id) => id !== communityId));
      }
      console.log('Delete action performed');
    } catch (error) {
      console.error('Error performing delete action:', error);
    }
  };

  
  return (
    <>
      
         {visibleInvites.length  > 0 ? (
          <>
          
            {comminfo.map((req:any) => (
                
                <article className='activity-card justify-between'>
                  <div className='flex items-center justify-center'>
              <Link key={req._id} href={`/communities/${req.communityId}`} className='flex items-center gap-3 justify-center flex-wrap'>
                  <Image
                    src={req.image}
                    alt='user_logo'
                    width={30}
                    height={30}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {req.username}
                    </span>
                    Send you a invite as member by
                  </p>
                 <p className='mr-1 !text-small-regular text-light-1'>
                    <span className=' text-primary-500'>
                      {req.createdByName}
                    </span>
                  </p>
                  </Link>
                  </div>
               <div className="flex justify-center items-center gap-6"> 
               
               <Button className="user-card_btn" size="sm" onClick={() => handleaccept(req.communityId)}>
               Accept
              </Button>
               
              <Button className="user-card_btn-delete" size="sm" onClick={() => handledelete(req.communityId)}>
               Delete
              </Button>
               </div>
                </article>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No one send you a invite as member</p>
        )} 
    </>
  )
}

export default AcceptDeleteButton
