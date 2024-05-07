
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { currentUser } from "@clerk/nextjs"
import { fetchUser, getactiveuser, getfollowersusers, getfollowingpeoplenumber, getmostlikedfivethreads, getuserintrests } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Intrestbutton from "@/components/shared/Intrestbutton";
export default async function Component() {
    const user = await currentUser();
    if(!user) return null;
    const userInfo = await fetchUser(user?.id || "");
    const posts  = await getmostlikedfivethreads(userInfo._id)
    const followingnumber = await getfollowingpeoplenumber(userInfo._id);
    const followers = await getfollowersusers(userInfo._id);
    const mostactiveuser = await getactiveuser(userInfo._id);
    const interest = await getuserintrests(userInfo._id);
    const data = {
      userID: userInfo?._id.toString(),
      userImage:userInfo?.image.toString()
    };
    const transformedInterests = interest.map((interest: any) => {
      return JSON.parse(JSON.stringify(interest));
    });
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 ">
      <div className="mx-auto max-w-4xl space-y-6 ">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Most Liked Posts</CardTitle>
              <CardDescription>Top 5 posts with the most likes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
              {posts.map((post) => (
        <div key={post._id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt={`Thumbnail of ${post.author.name}`}
              className="rounded-full"
              height={40}
              src={post.author.image || "/placeholder.svg"} 
              style={{
                aspectRatio: "40/40",
                objectFit: "cover",
              }}
              width={40}
            />
            <div>
              <h4 className="font-medium text-sm">{post.text}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{post.LikeCount} likes</p>
            </div>
          </div>
         <Link href={`/thread/${post.id}`}>
         <Button size="icon" variant="ghost">
            <MoveHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
         </Link>
        </div>
      ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Account Followers</CardTitle>
              <CardDescription>Total number of followers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-3xl font-bold">{followingnumber}</div>
                <CardHeader>
              <CardTitle>People who Following You</CardTitle>
            </CardHeader>
            </div>
            <CardContent>
              <div className="grid gap-3 mt-2">
              {followers.map((post:any) => (
        <div key={post._id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt={`Thumbnail of ${post.name}`}
              className="rounded-full"
              height={40}
              src={post.image || "/placeholder.svg"} 
              style={{
                aspectRatio: "40/40",
                objectFit: "cover",
              }}
              width={40}
            />
            <div>
              <h4 className="font-medium text-sm">{post.username}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{post.bio}</p>
            </div>
          </div>
         <Link href={`/profile/${post.id}`}>
         <Button size="icon" variant="ghost">
            <MoveHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
         </Link>
        </div>
      ))}
              </div>
            </CardContent>
              
            </CardContent>
          </Card>
          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
              <CardDescription>Top  users by engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 mt-2">
              {mostactiveuser.map((active) => (
        <div key={active._id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt={`Thumbnail of ${active.name}`}
              className="rounded-full"
              height={40}
              src={active.image || "/placeholder.svg"} 
              style={{
                aspectRatio: "40/40",
                objectFit: "cover",
              }}
              width={40}
            />
            <div>
              <h4 className="font-medium text-sm">{active.username}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{active.bio}</p>
            </div>
          </div>
         <Link href={`/profile/${active.id}`}>
         <Button size="icon" variant="ghost">
            <MoveHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
         </Link>
        </div>
      ))}
              </div>
            </CardContent>
              
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Search Result Appearances</CardTitle>
              <CardDescription>Total number of search result appearances in the last week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-3xl font-bold">1,234</div>
                <Button size="sm" variant="ghost" className="bg-dark-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Total number of groups the user is in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-3xl font-bold">25</div>
                <Button size="sm" variant="ghost" className="bg-dark-1">
                  View Groups
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4  bg-dark-2 text-light-1">
            <CardHeader>
              <CardTitle>My Intresst</CardTitle>
              <CardDescription>Descover Intrests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
              <Intrestbutton userId= {data.userID} interests={transformedInterests} userimage ={data.userImage}/>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function MoveHorizontalIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  )
}