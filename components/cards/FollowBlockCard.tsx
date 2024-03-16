"use client"
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { isuserFollowing, showless, showmore } from '@/lib/actions/user.action'
interface props {
    author : string,
    currentuser : string,
    isHomePage : boolean,
}
const FollowBlockCard = ({author,currentuser,isHomePage}:props) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const checkFollowStatus = async () => {
    try {
      // Here you would have a function that checks if the current user is following the author
      // This is just a placeholder for the actual implementation
      const response = await isuserFollowing(author, currentuser);
      setIsFollowing(response);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };
  // Call checkFollowStatus on component mount and when author or currentuser changes
  useEffect(() => {
    checkFollowStatus();
  }, [author, currentuser]);

  const handlefollow = async() =>{
    try {
      // Call the showmore server action
      await showmore(author, currentuser); // Pass the actual IDs

      // If successful:
      setIsFollowing(true);
      setAlert({ show: true, message: 'You are now following this user.' });
      // Hide the alert after some time
      setTimeout(() => setAlert({ show: false, message: '' }), 4000);
    } catch (error) {
      // Handle any errors here
      setAlert({ show: true, message: 'An error occurred. Please try again.' });
    }
  }
       
  const handleblock = async() =>{
    try {
      await showless(author, currentuser);
      setIsFollowing(false);
      setAlert({ show: true, message: 'You have blocked this user.' });
      setTimeout(() => setAlert({ show: false, message: '' }), 4000);
    } catch (error) {
      setAlert({ show: true, message: 'An error occurred. Please try again.' });
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
