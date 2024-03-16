import mongoose, { Schema } from "mongoose";
export interface ICategory extends Document {
    _id: string;
    name: string;
  }
const intrestSchema = new Schema({
  name: { type: String, unique: true },
});

export { intrestSchema };