import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { communityTabs } from "@/constants";
import UserCard from "@/components/cards/UserCard";
import Threadstab from "@/components/shared/Threadstab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCommunityDetails, gettrequstedjoin } from "@/lib/actions/community.actions";
import AddDeleteButton from "@/components/shared/AddDeleteButton";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;
  const communityDetails = await fetchCommunityDetails(params.id);
  const requests = await gettrequstedjoin(params.id);
  const data = {
    communityid: communityDetails._id.toString()
  }
  console.log(communityDetails)
  const isAdmin = communityDetails.admins?.some((admin:any) => admin.id === user.id);
  const iscreator = communityDetails.createdBy!== null && communityDetails.createdBy.id === user.id;
  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.createdBy.id}
        authuserInfo={user.id}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type='Community'
        members = {communityDetails.members}
        admins = {communityDetails.admins}
        commid = {data.communityid}
        iscreator = {iscreator}
        isadmin = {isAdmin}
        slugurl = {communityDetails.slugurl}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {communityDetails.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='threads' className='w-full text-light-1'>
         
            <Threadstab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
            {
  communityDetails.members.map((member: any) => {
    // Check if the member's id is equal to the creator's id
    const isCreator = member.id === communityDetails.createdBy.id;
    const isAdmin = communityDetails.admins.some((admin:any) => admin.id === member.id);
    return (
      <UserCard
        key={member.id}
        id={member.id}
        name={member.name}
        username={member.username}
        imgUrl={member.image}
        personType='User'
        commType='community'
        commid={data.communityid}
        authuserInfo={user.id}
        creatorid={communityDetails.createdBy.id}
        isCreator={isCreator} 
        admins = {isAdmin}// Pass isCreator as a prop
      />
    );
  })
}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-light-1'>
          { (isAdmin || iscreator) && (
  <section className='mt-9 flex flex-col gap-10'>
    {requests.requestedjoin.map((request: any) => {
      // Check if the request's id matches the community creator's id
      const ismember = communityDetails.members.some((admin:any) => admin.id === request.id);

      return (
        <article className='user-card'>
          <div className='user-card_avatar'>
            <div className='relative h-12 w-12'>
              <Image
                src={request.image}
                alt='user_logo'
                fill
                className='rounded-full object-cover'
              />
            </div>
    
            <div className='flex-1 text-ellipsis'>
              <h4 className='text-base-semibold text-light-1'>{request.name}</h4>
              <p className='text-small-medium text-gray-1'>@{request.username}</p>
            </div>
          </div>
          <AddDeleteButton
            communityId={params.id}
            userId={request._id.toString()}
           isMemberr = {ismember} // Pass isRequestCreator as a prop
          />
        </article>
      );
    })}
  </section>
)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;