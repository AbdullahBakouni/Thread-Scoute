"use client"

import Image from 'next/image'
import { Button } from '../ui/button'
import { useState } from 'react';
import { deleteuserintrest } from '@/lib/actions/user.action';
interface Interest {
    _id: string;
    name: string;
    
  }
interface props {
    userId: string;
    userimage:string;
    interests: Interest[];
}
const Intrestbutton = ({userId,interests,userimage}:props) => {
  const [currentInterests, setCurrentInterests] = useState(interests);
    const handleDelete = async (interestId: string) => {
        try {
          
          await deleteuserintrest(userId, interestId);
          
          setCurrentInterests(currentInterests.filter(interest => interest._id !== interestId));
        } catch (error) {
          console.error('Failed to delete the interest:', error);
        }
      };

    
  return (
    <>
    {currentInterests.map((interest) => (
      <div key={interest._id} className="flex items-center justify-between">
         <div className="flex items-center gap-3">
        <Image
          alt={`Thumbnail of ${interest.name}`}
          className="rounded-full"
          height={40}
          src={userimage || "/placeholder.svg"} 
          style={{
            aspectRatio: "40/40",
            objectFit: "cover",
          }}
          width={40}
        />
        <h4 className="font-medium text-sm">{interest.name}</h4>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleDelete(interest._id)}
        >
          <Image
            src="/assets/delete.svg"
            alt="delete"
            width={24}
            height={24}
          />
          <span className="sr-only">Delete Interest</span>
        </Button>
      
      </div>
    ))}
  </>
);
  
}

export default Intrestbutton
