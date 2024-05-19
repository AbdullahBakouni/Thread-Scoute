"use client"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { ThreadValidation } from '@/lib/validations/thread'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod"
import { useOrganization } from "@clerk/nextjs";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createThread } from '@/lib/actions/thread.action'
interface props {
    communityid:string;
    userId:string;
}
const CreateThreadButton = ({communityid,userId}:props) => {
    const router = useRouter();
const pathname = usePathname();
const [value, setValue] = useState('');
    const form = useForm({
        resolver : zodResolver(ThreadValidation),
        defaultValues :{
            thread : "",
            accountId : communityid,
            tags : ""
        }
    })
    const handleChange = (event:any) => {
        let newValue = event.target.value;
        // Check if the last character is a space and add # symbol
        if (newValue.endsWith(' ')) {
          newValue += '#';
        }
        // Ensure that the # symbol is always at the start of each word
        newValue = newValue.replace(/(^|\s)#?/g, '$1#');
        setValue(newValue);
      }
      const onSubmit = async (values : z.infer<typeof ThreadValidation>) =>{
        const sanitizedValue = value.replace(/#/g, '');
      const tagsArray = sanitizedValue.split(' ').filter(tag => tag !== '');
          await createThread({
            text : values.thread,
            tags : tagsArray,
            author : userId,
            communityId: communityid,
            path : pathname
          });
          
          router.push("/");
      }
  return (
    <div>
      <Drawer>
      <DrawerTrigger asChild>
        <Button className='user-card_btn'>CreateThread</Button>
      </DrawerTrigger>
      <DrawerContent className = "bg-dark-2 text-light-1 border-none">
        <DrawerHeader>
          <DrawerTitle>Create Thread</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-6 sm:px-6">
        <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="flex flex-col justify-start gap-4 mt-10">
        <FormField
        control={form.control}
        name="thread"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Content
            </FormLabel>
            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
              <Textarea
                rows={7}
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
        name="tags"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
              Tags
            </FormLabel>
            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
              <Input
                type="text"
                className="no-focus" 
                value = {value}
                onChange={handleChange}
                placeholder="Type here..."
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <Button className="bg-primary-500 mt-6" type="submit">
            Post Thraed
      </Button>
    </form>
    </Form>
        </div>
      </DrawerContent>
    </Drawer>
    </div>
  )
}

export default CreateThreadButton
