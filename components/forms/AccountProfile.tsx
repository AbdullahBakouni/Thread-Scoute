"use client";

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

import { Input } from "@/components/ui/input"
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { updateuser } from "@/lib/actions/user.action";
import { usePathname,useRouter } from "next/navigation";
 interface props  {
    user:{
        id : string;
        objectId : string;
        username : string;
        name : string;
        bio : string;
        image : string;
    };
    btnTitle : string;
}
const AccountProfile = ({user,btnTitle}:props) => {

const [files, setFiles] = useState<File[]>([]);
const router = useRouter();
const pathname = usePathname();
const {startUpload} = useUploadThing("media");
    const form = useForm({
        resolver : zodResolver(UserValidation),
        defaultValues :{
            profile_photo : user?.image || "",
            name : user?.name || "",
            username : user?.username || "",
            bio : user?.bio || "",
        }
    })
   
    const onSubmit = async( values: z.infer<typeof UserValidation>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const blob = values.profile_photo;
        const HasImageChanged = isBase64Image(blob); //check out if the iamge change

        if(HasImageChanged) {
          const imageresponse = await startUpload(files);//if  image change we have uploaded to database by uploadthing

          if(imageresponse && imageresponse[0].url){
            values.profile_photo = imageresponse[0].url;
          }
        }
        await updateuser(
         {
          name : values.name,
          username : values.username,
          bio : values.bio,
          image : values.profile_photo,
          userId :user.id,
          path : pathname
         }
        );

        if(pathname === "/profile/edit"){
          router.back();
        }
        else{
          router.push("/");
        }
      }
      //  }
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
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="flex flex-col justify-start gap-10">

      <FormField
        control={form.control}
        name="profile_photo"
        render={({ field }) => (
          <FormItem className="flex items-center gap-4">
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
          <FormItem className="flex flex-col  gap-3 w-full">
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
          <FormItem className="flex flex-col gap-3 w-full">
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
        name="bio"
        render={({ field }) => (
          <FormItem className="flex flex-col  gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Bio
            </FormLabel>
            <FormControl >
              <Textarea
               rows={10}
                className="account-form_input no-focus" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="bg-primary-500">{btnTitle}</Button>
    </form>
  </Form>
  )
}

export default AccountProfile
