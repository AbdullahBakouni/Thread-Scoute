import { getpostusercommentedon} from '@/lib/actions/user.action';
import { redirect } from 'next/navigation';
import React from 'react'
import ThreadCard from '../cards/ThreadCard';
interface props {
  currentUserId : string;
}
const Repliestab = async({ currentUserId }:props) => {
  // افترض أن هذه الدالة تجلب البيانات وتعيد مصفوفة البوستات والتعليقات
  const postsWithComments = await getpostusercommentedon(currentUserId);
  // console.log(postsWithComments)
  const postsWithCommentsArray = postsWithComments.map(post => ({
    ...post,
    commentDetails: Array.isArray(post.commentDetails) ? post.commentDetails : [post.commentDetails]
  }));
  console.log(postsWithCommentsArray)
  return (
    <div>
      {postsWithCommentsArray.map(item => (
        <div key={item.originalPost.id} className='mt-9 flex flex-col gap-10'>
          {/* عرض المنشور الأصلي */}
          <ThreadCard
          key={item.originalPost.id}
            id={item.originalPost.id}
            currentuserId={currentUserId}
            parentId={item.originalPost.parentId}
            content={item.originalPost.content}
            author={item.originalPost.author}
            createdAt={item.originalPost.createdAt}
            community={item.originalPost.community}
            comments={item.originalPost.comments}
            likes={item.originalPost.likes}
            // أضف الخصائص الأخرى حسب الحاجة
          />
          {/* عرض التعليقات الخاصة بالمنشور الأصلي */}
          {item.commentDetails.map(comment => (
            <ThreadCard
              key={comment.id}
              id={comment.id}
              content={comment.content}
              author={comment.author}
              createdAt={comment.createdAt}
              likes={comment.likes}
              parentId={comment.parentId}
              community={comment.community}
              comments={comment.comments}
              currentuserId={comment.author.id}
              iscomment
              // أضف الخصائص الأخرى حسب الحاجة
            />
          ))}
        </div>
      ))}
    </div>
  );
    
};



export default Repliestab
