import * as z from "zod";

export const CommunityValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(5, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 caracters." }),
  username: z
    .string()
    .min(5, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 caracters." }),
  bio: z
    .string()
    .min(5, { message: "Minimum 3 characters." })
    .max(1000, { message: "Maximum 1000 caracters." }),
    slugurl: z
    .string()
    .min(5, { message: "Minimum 3 characters." })
    .max(15, { message: "Maximum 1000 caracters." }),
});