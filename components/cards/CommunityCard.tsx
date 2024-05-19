import Image from "next/image";
import Link from "next/link";

import { Button } from "../ui/button";
import JoinButton from "../shared/JoinButton";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  members: {
    id:string;
    image: string;
  }[];
}

async function CommunityCard({ id, name, username, imgUrl, bio, members }: Props) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const data = {
    communityId: id.toString(),
    userId: userInfo._id.toString(),
  }
  const isMember = members.some(member => member.id === userInfo.id);
  return (
    <article className='community-card'>
      <div className='flex flex-wrap items-center gap-3'>
        <Link href={`/communities/${id}`} className='relative h-12 w-12'>
          <Image
            src={imgUrl}
            alt='community_logo'
            fill
            className='rounded-full object-cover'
          />
        </Link>

        <div>
          <Link href={`/communities/${id}`}>
            <h4 className='text-base-semibold text-light-1'>{name}</h4>
          </Link>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <p className='mt-4 text-subtle-medium text-gray-1'>{bio}</p>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <Link href={`/communities/${id}`}>
          <Button size='sm' className='community-card_btn'>
            View
          </Button>
        </Link>
        <JoinButton communityID = {data.communityId} userID = {data.userId} ismember = {isMember}/>
        {members.length > 0 && (
          <div className='flex items-center'>
            {members.map((member, index) => (
              <Image
                key={index}
                src={member.image}
                alt={`user_${index}`}
                width={28}
                height={28}
                className={`${
                  index !== 0 && "-ml-2"
                } rounded-full object-cover`}
              />
            ))}
            {members.length > 3 && (
              <p className='ml-1 text-subtle-medium text-gray-1'>
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default CommunityCard;