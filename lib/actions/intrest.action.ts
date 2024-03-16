"use server";
import Intrest from "../models/intrest";
import { ConnenctToDB } from "../mongoose";

export const createCategory = async ( categoryName:string , defaultValue?: string) => {
    ConnenctToDB();
    try {
      const newCategory = await Intrest.create({ name: categoryName || defaultValue});
  
      return JSON.parse(JSON.stringify(newCategory));
    } catch (error:any) {
        throw new Error(`Failed to create intrest ${error.message}`)
    }
  }
  
export const getAllCategories = async () => {
    ConnenctToDB();
    try {
      const categories = await Intrest.find();
  
      return JSON.parse(JSON.stringify(categories));
    } catch (error:any) {
      throw new Error(`Failed to fetch all intrest ${error.message}`)
    }
  }