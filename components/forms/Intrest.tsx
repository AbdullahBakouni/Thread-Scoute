"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { startTransition, useEffect, useState } from "react";
import { insertintrest } from "@/lib/actions/user.action";
import { createCategory, getAllCategories } from "@/lib/actions/intrest.action";
import { ICategory } from "@/lib/models/intrest.model";

  
  const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  })
  interface props {
    userId : string
  }
const Intrest =  ({userId}:props) => {
  const [showForm, setShowForm] = useState(true);
    const [selectedItems, setSelectedItems] = useState<ICategory[]>([]);
    const [newintrest, setNewIntrest] = useState("");
    

    const handleAddCategory = () => {
      const categoryName = newintrest.trim();
      if (categoryName) {
        createCategory(categoryName)
          .then((category) => {
            setSelectedItems((prevState) => [...prevState, category]);
            setNewIntrest("");
          });
      }
    };
    useEffect(() => {
      const getCategories = async () => {
        const categoryList = await getAllCategories();
  
        categoryList && setSelectedItems(categoryList as ICategory[])
      }
  
      getCategories();
    }, [])
    
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: selectedItems.map((item) => item._id),
        }
      })
     
        async  function onSubmit(data: z.infer<typeof FormSchema>) {
          const selectedIds: string[] = selectedItems
          .filter((item) => data.items.includes(item._id))
          .map((item) => item._id);
      
       
        await insertintrest(userId, selectedIds);
            setShowForm(false);
      }
   
      return (
        <>
          
            <Popover>
              <PopoverTrigger className="bg-dark-2 rounded-xl px-7 text-white text-body-bold py-5">
                Your Interests
              </PopoverTrigger>
              {showForm && (
              <PopoverContent className="bg-dark-2 mt-6 ml--7">
              
                <Form {...form}>
                  <form className="space-y-8 bg-dark-2 text-light-1">
                    <FormField
                      control={form.control}
                      name="items"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Choose Any</FormLabel>
                          </div>
                          {selectedItems.map((item) => (
                            <FormField
                              key={item._id}
                              control={form.control}
                              name="items"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item._id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item._id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item._id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item._id
                                              )
                                            )
                                      }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <AlertDialog>
                  <AlertDialogTrigger className="mt-5 text-light-1 bg-dark-1 px-7 py-2 rounded-xl hover:bg-dark-3">Add New</AlertDialogTrigger>
                  <AlertDialogContent className="bg-dark-2 text-light-1">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Determine Your Intrest </AlertDialogTitle>
                      <AlertDialogDescription>
                        <Input
                          type="text"
                          placeholder="Intrest Name"
                          className="border-none bg-dark-3 text-light-1 no-focus"
                          onChange={(e) => setNewIntrest(e.target.value)}
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-dark-2 text-light-1">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => startTransition(handleAddCategory)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="submit" className="flex justify-center items-center mt-5 hover:bg-dark-3" onClick={form.handleSubmit(onSubmit)}>
                  Submit
                </Button>
              </PopoverContent>
              )}
            </Popover>
        </>
      );
    }

export default Intrest
