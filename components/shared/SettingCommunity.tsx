"use client"
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { changeadmintomember, changemembertoadmin, deleteCommunity } from "@/lib/actions/community.actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
interface Props {
  Memberss?: {
    id: string;
    _id:string;
    name: string;
    image: string;
  }[];
  admins?: {
    id: string;
    _id:string;
    name: string;
    image: string;
  }[];
  communityid?: string;
}

export default function SettingCommunity({ Memberss, admins,communityid }: Props) {
  const router = useRouter();
  const path = usePathname();
  const [membersRoles, setMembersRoles] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    // Initialize roles for all members
    const initialRoles = Memberss?.reduce((acc, member) => {
      // Convert ObjectId to string
      const memberIdStr = member._id.toString();
      acc[memberIdStr] = admins?.some(admin => admin._id.toString() === memberIdStr) ? 'Admin' : 'Member';
      return acc;
    }, {} as { [key: string]: string });
    setMembersRoles(initialRoles ?? {});
  }, [Memberss, admins]);
  
  const handleRoleChange = async (memberObjectId:any) => {
    // Convert ObjectId to string
    const memberIdStr = memberObjectId.toString();
    const isAdmin = membersRoles[memberIdStr] === 'Admin';
    console.log(`Is Admin: ${isAdmin}`);
    try {
      if (isAdmin) {
        await changeadmintomember(communityid ?? "", memberIdStr,path);
        setMembersRoles(prev => ({ ...prev, [memberIdStr]: 'Member' }));
      } else {
        await changemembertoadmin(communityid ?? "", memberIdStr,path);
        setMembersRoles(prev => ({ ...prev, [memberIdStr]: 'Admin' }));
      }
    } catch (error) {
      console.error(`Error changing role: ${error}`);
    }
  };

  const handleDelete = async () => {
    await deleteCommunity(communityid ?? "");
    router.push(`/communities`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" size="icon" variant="ghost">
          {/* SettingsIcon component here */}
          <SettingsIcon className="h-5 w-5 text-gray-1" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-dark-2 text-light-1">
        {Memberss?.map((member) => (
          <div className="flex items-center gap-4 p-4" key={member.id}>
            <Avatar className="h-8 w-8">
              <AvatarImage alt={member.name} src={member.image} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{member.name}</h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>{membersRoles[member._id]}</p>
            </div>
            <Button className="ml-auto user-card_btn" size="sm" onClick={() => handleRoleChange(member._id)}>
              Change Role
            </Button>
          </div>
        ))}
        <div className="grid gap-2 p-4">
          <Button variant="destructive" onClick={handleDelete}>Delete Community</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function SettingsIcon(props:any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
