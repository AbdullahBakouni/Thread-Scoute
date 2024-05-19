"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { removeUserFromCommunity } from "@/lib/actions/community.actions";
import Link from "next/link";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType?: string;
  commType?:string;
  commid?:string;
  authuserInfo?:string;
  creatorid?:string;
  isCreator?:boolean;
  admins?: boolean;
}

function UserCard({ id, name, username, imgUrl, personType , commType,commid,creatorid,isCreator,admins}: Props) {
  const router = useRouter();
  const isCommunity = personType === "Community";
  const handledelete = async () =>{
    if (typeof id === 'string' && typeof commid === 'string') {
      try {
        await removeUserFromCommunity(id, commid);
      } catch (error) {
        // Handle the error appropriately
        console.error('Failed to remove user from community:', error);
      }
    } else {
      console.error('id or commid is undefined');
    }
  }
  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Link href="#">
          <Image
            src={imgUrl}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
          </Link>
        </div>

        <div className='flex-1 text-ellipsis'>
        {commType === 'community'? (
            <h4 className='text-base-semibold text-light-1'>@{username}</h4>
          ) : (
            <h4 className='text-base-semibold text-light-1'>{name}</h4>
          )}
          {commType === 'community'&& admins === true && <p className='text-small-medium text-gray-1'>Admin</p>}
          {commType === 'community' && isCreator === true && <p className='text-small-medium text-gray-1'>Creator</p>}
          {commType === 'community' && admins === false && isCreator === false && <p className='text-small-medium text-gray-1'>Member</p>}
        </div>
      </div>

        
      <Button
        className='user-card_btn'
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>
    
      {commType === 'community' && (isCreator || admins) && !(creatorid === id) &&(
        <Button className="user-card_btn-delete" onClick={handledelete}>
          Remove User
        </Button>
      )}
    </article>
  );
}

export default UserCard;