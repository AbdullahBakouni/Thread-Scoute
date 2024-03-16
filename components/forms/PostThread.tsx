"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod"
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
import { Textarea } from "../ui/textarea";
import { usePathname,useRouter } from "next/navigation";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.action";
import { Input } from "../ui/input";
import { useState } from "react";
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



const PostThread = ({userId} : {userId :string}) => {
const router = useRouter();
const pathname = usePathname();
const [value, setValue] = useState('');


    const form = useForm({
        resolver : zodResolver(ThreadValidation),
        defaultValues :{
            thread : "",
            accountId : userId,
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
          communityId : null,
          path : pathname
        });
        
        router.push("/");
    }
  return (
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
                rows={10}
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
                // {...field}
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
    
  )
}

export default PostThread
