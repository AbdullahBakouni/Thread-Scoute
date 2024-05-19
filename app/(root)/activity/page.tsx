import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, getActivity, getInvitationsWithCommunities, getInvitationsWithCommunitiesaddmins, getshareactivity } from "@/lib/actions/user.action";
import { addnotificationcommunitiesjoin } from "@/lib/actions/community.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activitytab } from "@/constants";
import { Button } from "@/components/ui/button";
import { Item } from "@radix-ui/react-dropdown-menu";
import AcceptDeleteButton from "@/components/shared/AcceptDeleteButton";
import AcceptDeleteButtonasAdmin from "@/components/shared/AcceptDeleteButtonasAdmin";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
    const recievethreads = await getshareactivity(userInfo._id);
    const communitiesrequest = await addnotificationcommunitiesjoin(userInfo._id);
    const communityintivitationasmember = await getInvitationsWithCommunities(userInfo._id);
    const communityintivitationasadmin = await getInvitationsWithCommunitiesaddmins(userInfo._id);
  console.log(communityintivitationasmember)
    const dataObjects = communityintivitationasmember.map(item => {
      return {
        communityId: item._id.toString(),
      username: item.username,
      name: item.name,
      slugurl: item.slugurl,
      image: item.image,
      bio: item.bio,
      createdBy: item.createdBy._id.toString(),
      createdByName: item.createdBy.username,
      threads: item.threads,
      members: item.members.map((member:any) => member.toString()),
      requestedjoin: item.requestedjoin.map((request:any) => request.toString()),
      intivitionasmembers: item.intivitionasmembers.map((invite:any) => invite.toString()),
      intivitionasadmins: item.intivitionasadmins.map((admin:any) => admin.toString()),
      version: item.__v
      };
    });
    const dataObjectsasadmin = communityintivitationasadmin.map(item => {
      return {
      communityId: item._id.toString(),
      username: item.username,
      name: item.name,
      slugurl: item.slugurl,
      image: item.image,
      bio: item.bio,
      createdBy: item.createdBy._id.toString(),
      createdByName: item.createdBy.username,
      threads: item.threads,
      members: item.members.map((member:any) => member.toString()),
      admins: item.admins.map((admin:any) => admin.toString()),
      requestedjoin: item.requestedjoin.map((request:any) => request.toString()),
      intivitionasmembers: item.intivitionasmembers.map((invite:any) => invite.toString()),
      intivitionasadmins: item.intivitionasadmins.map((admin:any) => admin.toString()),
      version: item.__v
      };
    });
    const datauser = {
      userId:userInfo._id.toString()
    }
  return (
    <>
      <h1 className='head-text'>Activity</h1>

      <div className='mt-9'>
        <Tabs defaultValue='comments' className='w-full'>
          <TabsList className='tab'>
            {activitytab.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='comments' className='w-full text-light-1'>
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
        </section >
          </TabsContent>

          <TabsContent value='share' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-4'>
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
            </section >
          </TabsContent>

          <TabsContent value='communities' className='w-full text-light-1'>
          <section className='mt-10 flex flex-col gap-5'>
        {communitiesrequest.requests.length > 0 ? (
          <>
            {communitiesrequest.requests.map((req:any) => (
              <>
              
              <Link key={req._id} href={`/communities/${req.id}`}>
              <article className='activity-card'>
                  <Image
                    src={req.image}
                    alt='user_logo'
                    width={30}
                    height={30}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>
                      {req.username}
                    </span>{" "}
                    A request to join this group has arrived
                  </p>
                 
                </article>
                </Link>
                </>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No one send you a request to goin to your groups</p>
        )}

      <AcceptDeleteButton comminfo = {dataObjects} userinfo={datauser}/>
         
     
        <AcceptDeleteButtonasAdmin comminfoasadmin = {dataObjectsasadmin} userinfo = {datauser} />

        </section >

          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default Page;