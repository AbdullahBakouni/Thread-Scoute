"use client"
import Image from 'next/image'
import { IoMdSend } from "react-icons/io";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Input } from '../ui/input'
import { addpostshared, fetchUserByName, savepostshared } from '@/lib/actions/user.action';
import { useState } from 'react';

interface params {
    postId : string;
    currentUser : string;
}

const ShareButton =   ({postId , currentUser}:params) => {
    const [user,setUser] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    async function handleclick(){
        if (user.length === 0) {
          alert('Please enter a valid username begain with @');
          return;
        }
        const newUser = await fetchUserByName(user);
        const userdata = {
          id : newUser.id.toString(),
          objectid: newUser._id.toString()
        }
        if (!newUser) {
          alert('User not found');
          return;
        }
        await savepostshared(currentUser,postId);
        await addpostshared(userdata.id , currentUser , postId);
        setIsOpen(false); // إغلاق الـ Popover بعد النجاح
    }

    return (
        <>
          <Popover>
            {isOpen && (
              <PopoverContent className='bg-dark-2 px-7 border-text-light-3'>
                  <span className='text-light-2 mt-4 '>Share With People</span>
                 <div className='flex gap-3 justify-center items-center'>
                 <Input 
                  type='text'
                  placeholder='@username'
                  className='no-focus bg-dark-3 text-light-1 mt-4 border-none'
                  onChange={(e) => setUser(e.target.value.slice(1))}
                  />
                  <IoMdSend className='text-heading4-bold text-white mt-3 cursor-pointer' onClick={handleclick} />
                 </div>
              </PopoverContent>
            )}
            <PopoverTrigger className='flex' onClick={() => setIsOpen(!isOpen)}>
              <Image 
                src="/assets/share.svg"
                alt='share'
                width={24}
                height={24}
                className='cursor-pointer object-contain flex'
              />
            </PopoverTrigger>
          </Popover>
        </>
      )
}

export default ShareButton
