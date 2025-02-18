import express from "express";
const app = express();
const PORT = process.env.PORT || 8000;
const fal_api_key = process.env.FAL_KEY;
import {TrainModel,GenerateImage,GenerateImagesFromPack,} from "common/types";
import prismaClient from "db";
import { s3,write,S3Client } from "bun";
app.use(express.json());

const USER_ID = "2";
app.post("/ai/training", async (req, res) => {
  const parsedBody = TrainModel.parse(req.body);
  if (!parsedBody) {
    res.status(411).json({
      message: "Invalid Request Body",
    });
    return;
  }
  const data = await prismaClient.model.create({
    data: {
      name: parsedBody.name,
      type: parsedBody.type,
      age: parsedBody.age,
      ethnecity: parsedBody.ethnecity,
      eyeColor: parsedBody.eyeColor,
      bald: parsedBody.bald,
      userId: USER_ID,
    },
  });
  res.json({
    modelId: data.id,
  });
});

app.post("/ai/generate", async (req, res) => {
  const parsedBody = GenerateImage.parse(req.body);
  if (!parsedBody) {
    res.status(411).json({
      message: "Invalid Request Body",
    });
    return;
  }

  const data = await prismaClient.outputImages.create({
    data: {
      prompt: parsedBody.prompt,
      modelId: parsedBody.modelId,
      userId: USER_ID,
      imageUrl: "",
    },
  });
  res.json({
    imageId: data.id,
  });
});

app.post("/pack/generate", async (req, res) => {
  const parsedBody = GenerateImagesFromPack.parse(req.body);
  if (!parsedBody) {
    res.status(411).json({
      message: "Invalid Request Body",
    });
    return;
  }
  const prompts = await prismaClient.packPrompts.findMany({
    where: {
      packId: parsedBody.packId,
    },
  });

  const images = await prismaClient.outputImages.createManyAndReturn({
    data: prompts.map((prompt) => ({
      prompt: prompt.prompt,
      userId: USER_ID,
      modelId: parsedBody.modelId,
      imageUrl: "",
    })),
  });
  res.json({
    imageIds: images.map((image) => image.id),
  });
});

app.get("/pack/bulk", async (req, res) => {
  const parsedBody = GenerateImagesFromPack.safeParse(req.body);
  if (!parsedBody) {
    res.status(411).json({
      message: "Invalid Request Body",
    });
    return;
  }
  const packs = await prismaClient.packs.findMany({});
  res.json({
    packs,
  });
});
app.get("/ai/images/bulk", (req, res) => {
  const ids = req.query.images as string[];
  // const parsedImages = JSON.parse(images);
  const limit = (req.query.limit as string) ?? "10";
  const offset = (req.query.offset as string) ?? "0";
  const imagesData = prismaClient.outputImages.findMany({
    where: {
      id: {
        in: ids,
      },
      userId: USER_ID,
    },
    skip: parseInt(offset),
    take: parseInt(limit),
  });
  console.log(ids);
  res.json({
    images: imagesData,
  });
});
app.post("/fal-ai/webhook/train", async (req, res) => {
  const body = req.body;
  const requestId = body.request_id;
  await prismaClient.model.updateMany({
    where: {
      falAiRequestId: requestId,
    },
    data: {
      trainingStatus: "generated",
      tensorPath: req.body.tensor_path
    }
});
  res.json({
    message: "webhook received",
  });
});
app.post("/fal-ai/webhook/image", async (req, res) => {
  const requestId = req.body.request_id;
  const imageId = req.body.image_id;
  await prismaClient.outputImages.updateMany({
    where: {
      falAiRequestId: requestId  
    },
    data: {
      status: "generated",
      imageUrl: req.body.image_Url,
    }
  })
  res.json({
    message: "webhook received",
  });
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
