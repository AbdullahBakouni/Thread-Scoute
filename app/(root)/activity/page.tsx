import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, getActivity, getshareactivity } from "@/lib/actions/user.action";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
    const recievethreads = await getshareactivity(userInfo._id);
    console.log(recievethreads)
  return (
    <>
      <h1 className='head-text'>Activity</h1>

      <section className='mt-10 flex flex-col gap-5'>
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className='activity-card'>
                  <Image
                    src={activity.author.image}
                    alt='user_logo'
                    width={30}
                    height={30}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {activity.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No one comment on your post</p>
        )}
          {recievethreads.length > 0 ? (
          <>
            {recievethreads.map((activity:any) => (
              <Link key={activity._id} href={`/thread/${activity._id}`}>

                <article className='activity-card'>
                    {activity.sharedby.map((user:any)=>(
                        <div className="flex justify-center gap-4">
                            <Image 
                            src={user.image}
                            alt="user iamge"
                            width={30}
                            height={30}
                            className='rounded-full object-cover'
                            />
                            <p className="text-light-1 "><span className="text-primary-500 !text-small-regular mr--2">{user.username}</span> share you a post</p>
                        </div>
                    ))}
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {activity.text}
                    </span>{" "}
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No one share you a post</p>
        )}
      </section>
    </>
  );
}

export default Page;