import { getuserrecievedthreads } from '@/lib/actions/user.action';
import ThreadCard from '../cards/ThreadCard';
interface props {
    currentUserId : string,
    accountType : string
}
const Taggedtab = async ({currentUserId,accountType}:props) => {

    const result = await getuserrecievedthreads(currentUserId);
    console.log(result);
  return (
    <section className='mt-9 flex flex-col gap-10'>
    {result.map((re:any) => (
      <ThreadCard
        key={re._id}
        id={re._id}
        currentuserId={currentUserId}
        parentId={re.parentId}
        content={re.text}
        author={
          accountType === "User"
            ? { name:re.author.name, image: re.author.image, id: re.author.id }
            : {
                name: re.author.name,
                image: re.author.image,
                id: re.author.id,
              }
        }
        community= {re.community}
        createdAt={re.createdAt}
        comments={re.children}
        likes = {re.LikeCount}
      />
    ))}
  </section>
  )
}

export default Taggedtab
