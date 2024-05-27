
"use client"
import { DialogTrigger, DialogFooter, DialogContent, Dialog } from "@/components/ui/dialog"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from "next/image"

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/users";
import * as z from "zod";
import {useUploadThing} from "@/lib/uploadthing"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { fetchUsersByUsername, updateuser } from "@/lib/actions/user.action";
import { usePathname,useRouter } from "next/navigation";
import { CommunityValidation } from "@/lib/validations/communities"
import { updateCommunityInfo } from "@/lib/actions/community.actions"
interface props {
    communityId:string;
    userId:string;
    communityname:string;
    communityusername:string;
    communitybio:string;
    communityimage:string;
    slugUrl:string;
}

export default function EditCommunity({communityId,userId,communityname,communityusername,communitybio,communityimage,slugUrl}:props) {
const [files, setFiles] = useState<File[]>([]);
const router = useRouter();
const pathname = usePathname();
const {startUpload} = useUploadThing("media");
const [membersArray, setMembersArray] = useState<string[]>([]);
 const [AdminsArray, setAdminsArray] = useState<string[]>([]);
 const [textValue, setTextValue] = useState('');
  const [admintValue, setAdminValue] = useState('');
const [open,SetIsopen] = useState(true);
    const handleMembersChange = async (event: any) => {
      const newMembersArray = event.target.value.split(',').map((name: any) => name.trim()).filter(Boolean);
      setTextValue(event.target.value);
      
      try {
        const userIds : string[] = await fetchUsersByUsername(newMembersArray);
        setMembersArray(userIds);
      } catch (error) {
        console.error('Failed to fetch user IDs:', error);
      }
    
    };
    
      
      const handleAdminsChange = async (event:any) => {
        const newMembersArray = event.target.value.split(',').map((name: any) => name.trim()).filter(Boolean);
        setAdminValue(event.target.value);
      
      try {
        const userIdss : string[] = await fetchUsersByUsername(newMembersArray);
        setAdminsArray(userIdss); 
      } catch (error) {
        console.error('Failed to fetch user IDs:', error);
      }
     
      };
  const form = useForm({
        resolver : zodResolver(CommunityValidation),
        defaultValues :{
            profile_photo : communityimage ||"",
            name :communityname ||"",
            username :communityusername || "" ,
            slugurl : slugUrl || "",
            bio : communitybio || "",
            members :"",
            admins : "",
        }
    })
    const onSubmit = async (values: z.infer<typeof CommunityValidation>) =>{
         
         const blob = values.profile_photo;
         const HasImageChanged = isBase64Image(blob); //check out if the iamge change
 
         if(HasImageChanged) {
           const imageresponse = await startUpload(files);//if  image change we have uploaded to database by uploadthing
 
           if(imageresponse && imageresponse[0].url){
             values.profile_photo = imageresponse[0].url;
           }
         }

         await updateCommunityInfo(communityId,values.name,values.username,values.profile_photo,
          values.bio,values.slugurl,pathname, membersArray,
          AdminsArray,
         )
         router.push(`${communityId.toString()}`);
         SetIsopen(false);
    }
    const handleImage = (e:ChangeEvent<HTMLInputElement>  ,fieldChange:(value : string) => void) =>{
      e.preventDefault();

      const Filereader = new FileReader();
      
      if(e.target.files && e.target.files.length > 0){
        const file = e.target.files[0] ;

          setFiles(Array.from(e.target.files));

          if(!file.type.includes("image")) return;

          Filereader.onload = async (event)=>{
          const imagedDataUrl = event.target?.result?.toString() || "" ;
          fieldChange(imagedDataUrl); // that ways to update data in zod
          }
          Filereader.readAsDataURL(file);
      }
  }
  return (
    <>
    {open && (
    <Dialog>
    
      <DialogTrigger asChild>
      <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />

              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-dark-2 text-light-1">
      <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="flex flex-col justify-start gap-2">

      <FormField
        control={form.control}
        name="profile_photo"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormLabel className="account-form_image-label">
              {field.value ? (
                <Image 
                src= {field.value}
                alt = "profile_photo"
                width={96}
                height={96}
                priority
                className="object-contain rounded-full"
                />
              ) : (
                <Image 
                src= "/assets/profile.svg"
                alt = "profile_photo"
                width={24}
                height={24}
                className="object-contain"
                />
              )}
            </FormLabel>
            <FormControl className="flex-1 text-base-semibold text-gray-200">
              <Input
                type="file"
                accept="image/*"
                placeholder="Upload a photo"
                className="account-form_image-input"
                onChange={(e) => handleImage(e,field.onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
        
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col  gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Name
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              UserName
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slugurl"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Slugurl
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
        <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Bio
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="members"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
            Invite Others as Members
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
                value = {textValue}
                onChange={handleMembersChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="admins"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 w-full">
            <FormLabel className="text-base-semibold text-light-2">
            Invite Others as Admins
            </FormLabel>
            <FormControl >
              <Input
                type="text"
                className="account-form_input no-focus" 
                {...field}
                value={admintValue}
                onChange={handleAdminsChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="bg-primary-500">Continue</Button>
    </form>
  </Form>
      </DialogContent>
    
    </Dialog>
    )}
    </>
  )
}