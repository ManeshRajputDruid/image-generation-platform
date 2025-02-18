import { z } from "zod"; // <-- This is the problem
//traning the specific model
export const TrainModel = z.object({
  name: z.string(),
  type: z.enum(["Man", "Woman", "Others"]),
  age: z.number(),
  ethnecity: z.enum([
    "White",
    "Black",
    "Asian_American",
    "East_Asian",
    "South_East_Asian",
    "South_Asian",  
    "Middle_Eastern",
    "Pacific",
    "Hispanic",
  ]),
  eyeColor: z.enum(["Blue", "Brown", "Gray", "Hazel"]),
  bald: z.boolean(),
  userId: z.string(),
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

