"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { getusercommunitiescount, removeUserFromCommunity } from '@/lib/actions/community.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
interface props {
    usercommunities : {
        bio:string;
        createdBy : {
            name:string;
            image:string;
            id:string;
        };
        id:string;
        name:string;
        image:string;
    }[];
    userId:string;
    communitynumber:number;
    objectuserID:string;
}
const LeaveCommunityButton =  ({usercommunities,userId,communitynumber,objectuserID}:props) => {
  const isCreator = usercommunities.some((community) => community.createdBy?.id.toString() === objectuserID);
  const path = usePathname();
 
    const [hasLeft, setHasLeft] = useState(false);
    const [communities, setCommunities] = useState(usercommunities);
    const [communityCount, setCommunityCount] = useState(usercommunities.length);
    // const iscreator = usercommunities.createdBy!== null && usercommunities.createdBy.id === userId; 
    const handleDelete = async (commid: any) => {
        try {
            await removeUserFromCommunity(userId,commid);
            // If successful, update the state to reflect that the user has left
            const updatedCommunities = communities.filter(comminfo => comminfo.id.toString() !== commid.toString());
            setCommunities(updatedCommunities);
            // setHasLeft(true);
           const countcomm = await getusercommunitiescount(userId,path)
           setCommunityCount(countcomm.communityCount);
        } catch (error) {
            // Handle error (e.g., display an error message)
            console.error('Failed to leave community:', error);
        }
    };

    // If the user has left, don't render anything
    if (hasLeft) return null;
  return (
    <div>
      <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Total number of groups the user is in  <span className="text-light-1 text-heading3-bold ml-1">{communitynumber}</span></CardDescription>
            </CardHeader>
          <CardContent>
         <div className="flex flex-col gap-5">
              <div className="grid gap-4">
              {communities.map((comminfo:any) => (
        <div key={comminfo._id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              alt={`Thumbnail of ${comminfo.name}`}
              className="rounded-full"
              height={40}
              src={comminfo.image || "/placeholder.svg"} 
              style={{
                aspectRatio: "40/40",
                objectFit: "cover",
              }}
              width={40}
            />
            <div>
              <h4 className="font-medium text-sm">{comminfo.bio}</h4>
                        {!isCreator? (
                <p className="text-xs text-gray-500 dark:text-gray-400">By {comminfo.createdBy.name}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">By You</p>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center gap-3">
              <Link href={`/communities/${comminfo.id}`}>
         <Button size="icon" variant="ghost">
            <MoveHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
         </Link>
         {!isCreator && 
          <Button className="user-card_btn-delete" onClick={() => handleDelete(comminfo.id)}>
            Leave community
          </Button>
        }
              </div>
        </div>
      ))}
              </div>
              </div>
              </CardContent>
              </Card>
      
    </div>
  )
}
function MoveHorizontalIcon(props:any) {
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
        <polyline points="18 8 22 12 18 16" />
        <polyline points="6 8 2 12 6 16" />
        <line x1="2" x2="22" y1="12" y2="12" />
      </svg>
    )
  }
export default LeaveCommunityButton
