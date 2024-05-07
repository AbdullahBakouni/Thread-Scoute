"use client";
import React, { useEffect, useState } from 'react'
import { addlike, removelike } from '@/lib/actions/thread.action';
import { usePathname } from 'next/navigation';
import { RiHeart3Fill } from "react-icons/ri";
import { CiHeart } from "react-icons/ci";
interface props {
    data : {
        threadId: string;
        userId : string;
    };
    initialLikes: number;
   
}

const LikeButton =  ({data,initialLikes}:props) => {
    const pathname = usePathname();
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        // تحقق من حالة الإعجاب في التخزين المحلي
        const likeStatus = localStorage.getItem(`liked_${data.threadId}_${data.userId}`);
        setLiked(likeStatus === 'true');
        // استرجاع عدد الإعجابات الحالي من التخزين المحلي أو القيمة الأولية
        const storedLikes = localStorage.getItem(`likes_${data.threadId}`);
        setLikes(storedLikes ? parseInt(storedLikes) : initialLikes);
    }, [data.threadId, data.userId, initialLikes]);

    const handleLike = async () => {
        let newLikes = likes;
        if (liked) {
            newLikes = Math.max(likes - 1, 0); // تأكد من ألا ينخفض العدد إلى أقل من الصفر
            localStorage.setItem(`liked_${data.threadId}_${data.userId}`, 'false');
            localStorage.setItem(`likes_${data.threadId}`, newLikes.toString());
            try {
                await removelike(data.threadId, data.userId, pathname);
            } catch (error) {
                console.error('Failed to remove like from the thread:', error);
            }
        } else {
            newLikes = likes + 1;
            localStorage.setItem(`liked_${data.threadId}_${data.userId}`, 'true');
            localStorage.setItem(`likes_${data.threadId}`, newLikes.toString());
            try {
                await addlike(data.threadId, data.userId, pathname);
            } catch (error) {
                console.error('Failed to like the thread:', error);
            }
        }
        setLikes(newLikes);
        setLiked(!liked);
    };

    return (
        <>
            <button className="bg-transparent" onClick={handleLike}>
                <CiHeart  className={`cursor-pointer object-contain text-heading3-bold ${liked ? 'text-red-500' : 'text-gray-500'}`} />
                <span>{likes}</span>
            </button>
        </>
    )
}

export default LikeButton
