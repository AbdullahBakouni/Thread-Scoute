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
import { Input } from "../ui/input";
import { usePathname,useRouter } from "next/navigation";
import { CommentValidation} from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.action";
interface props{
    postId : string;
    currentUserId :string;
    currentUserImage : string;
}

const Comment = ({postId,currentUserImage,currentUserId}:props) => {
    const router = useRouter();
    const pathname = usePathname();
    const form = useForm({
        resolver : zodResolver(CommentValidation),
        defaultValues :{
            thread : ""
        }
    })
    const onSubmit = async (values : z.infer<typeof CommentValidation>) =>{
        await addCommentToThread(postId, values.thread , JSON.parse(currentUserId) , pathname);
        
        form.reset();
    }
  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="comment-form">

        <FormField
        control={form.control}
        name="thread"
        render={({ field }) => (
          <FormItem className="flex items-cenetr gap-3 w-full">
            <FormLabel>
              <Image 
                src={currentUserImage}
                alt="userImage"
                width={48}
                height={48}
                className="object-cover rounded-full "
              />
            </FormLabel>
            <FormControl className="border-none bg-transparent">
              <Input
                type="text"
                placeholder="Comment..."
                className="no-focus outline-none text-light-1" 
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <Button className="comment-form_btn" type="submit">
         Reply
      </Button>
    </form>
    </Form>
  )
}

export default Comment
