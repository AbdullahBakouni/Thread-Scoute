import { intrestSchema } from "./intrest.model";
import mongoose from "mongoose";

const Intrest = mongoose.models.Intrest || mongoose.model("Intrest", intrestSchema);

export default Intrest;