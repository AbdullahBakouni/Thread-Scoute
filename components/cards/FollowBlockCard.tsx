"use client"
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { isuserFollowing, revalidat, showless, showmore } from '@/lib/actions/user.action'
import { usePathname } from 'next/navigation'
// import { usePathname } from 'next/navigation'
interface props {
    author ?: string,
    currentuser : string,
    isHomePage : boolean,
}
const FollowBlockCard = ({author,currentuser,isHomePage}:props) => {
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const checkFollowStatus = async () => {
    if (author) {
      try {
        const response = await isuserFollowing(author, currentuser);
        setIsFollowing(response);
  
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    }
  };
  // Call checkFollowStatus on component mount and when author or currentuser changes
  useEffect(() => {
    checkFollowStatus();
  }, [author, currentuser]);

  const handlefollow = async () => {
    if (author) {
      try {
        await showmore(author, currentuser);
        setIsFollowing(true);
        setAlert({ show: true, message: 'You are now following this user.' });
        setTimeout(() => setAlert({ show: false, message: '' }), 4000);
      } catch (error) {
        setAlert({ show: true, message: 'An error occurred. Please try again.' });
      }
    }
  };
  
       
  const handleblock = async () => {
    console.log('handleblock called'); 
    if (author) {
      try {
        await showless(author, currentuser);
        setIsFollowing(false);
        setAlert({ show: true, message: 'You have blocked this user.' });
        setTimeout(() => setAlert({ show: false, message: '' }), 4000);
      } catch (error) {
        setAlert({ show: true, message: 'An error occurred. Please try again.' });
      }
    }
  };
  
  return (
    <>
    {isHomePage &&  author !== currentuser &&(
      <div className="flex justify-between items-center mt-5">
        {alert.show && <div className="text-light-1">{alert.message}</div>}
        {!isFollowing ? (
          <Button variant="secondary" className="bg-dark-3 text-light-2 rounded-full hover:bg-dark-1" onClick={handlefollow}>
            Follow
          </Button>
        ) : (
          <Button variant="secondary" className="bg-dark-3 text-light-2 rounded-full hover:bg-dark-1" onClick={handleblock}>
            Block
          </Button>
       )}
      </div>
    )}
  </>
);

}
export default FollowBlockCard
