import { z } from "zod"; // <-- This is the problem
//traning the specific model
const TrainModel = z.object({
  name: z.string(),
  type: z.enum(["Man", "Women", "Kids", "Other"]),
  age: z.number(),
  ethnecity: z.enum([
    "White",
    "Black",
    "Asian American",
    "East Asian",
    "South East Asian",
    "South Asian",
    "Middle Eastern",
    "Pacific",
    "Hispanic",
    "Other",
  ]),
  eyeColor: z.enum(["Blue", "Brown", "Gray", "Hazel", "Other"]),
  Bald: z.boolean(),
  images: z.array(z.string()),
});

//generate the image from the model
export const GenerateImage = z.object({
    prompt: z.string(), 
    modelId: z.string(),
    num: z.number(),
});
//generate the image from the pack of the model
export const GenerateImagesFromPack = z.object({
    modelId: z.string(),
    packId: z.string(),
});

