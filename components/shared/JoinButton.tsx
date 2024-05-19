"use client"
import { requestJoinToCommunity } from '@/lib/actions/community.actions';
import { Button } from '../ui/button'
import { useState } from 'react';
interface props {
    communityID:string;
    userID:string;
    ismember:boolean;
}
const JoinButton = ({communityID,userID,ismember}:props) => {
    const [isJoining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(ismember);
    const handleClick = async () => {
        if (ismember) {
            alert("You are already a member of this community.");
            return;
        }
        try {
            setJoining(true);
            await requestJoinToCommunity(communityID, userID);
            alert("Your request to join the community has been sent.");
            setHasJoined(true);
            setJoining(false);
        } catch (error: any) {
            setJoining(false);
        }
    };

    
    if (hasJoined) return null;
  return (
    <> <Button size='sm' className='community-card_btn mr-10' onClick={handleClick} disabled={isJoining}>
    {isJoining ? "Joining..." : "Join Community"}
</Button>
    </>
  )
}

export default JoinButton
