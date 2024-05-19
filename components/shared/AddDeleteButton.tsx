"use client"
import { addMemberToCommunity } from '@/lib/actions/community.actions';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { removeUserFromRequestedJoin } from '@/lib/actions/user.action';
interface Props {
  communityId: string;
  userId: string;
  isMemberr?: boolean;
}

const AddDeleteButton = ({ communityId, userId, isMemberr }: Props) => {
  const path = usePathname();
  const [isMember, setIsMember] = useState(false);
  const [showFragment, setShowFragment] =  useState(true);
  const [actionResult, setActionResult] = useState<string>('');
  useEffect(() => {
    // Check if the user is a member or an admin when the component mounts
    if (isMemberr) {
      setIsMember(true);
      setShowFragment(false); // Hide the fragment if the user is a member
    }
  }, [isMemberr]);

  const handleAdd = async () => {
    // Async server action for adding
    try {
      await addMemberToCommunity(communityId, userId,path);
      setIsMember(true);
      setActionResult('Accepted');
      
      console.log('Add action performed');
    } catch (error) {
      console.error('Error performing add action:', error);
    }
  };

  const handleDelete = async () => {
    // Async server action for deleting
    try {
    await removeUserFromRequestedJoin(communityId,userId,path)
    setIsMember(false);
    setActionResult('Rejected');
      console.log('Delete action performed');
    } catch (error) {
      console.error('Error performing delete action:', error);
    }
  };
  return (
    <>
    {!isMember && (
      <Button className="user-card_btn" onClick={handleAdd}>
        Add
      </Button>
    )}
    <Button className="user-card_btn-delete" onClick={handleDelete}>
      Delete Request
    </Button>
    <p className='text-light-1'>{actionResult}</p>
  </>
  );
};

export default AddDeleteButton;
