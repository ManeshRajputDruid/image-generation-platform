import express from "express";
import prismaClient from "db";
const PORT = process.env.PORT || 8000;
const fal_api_key = process.env.FAL_KEY;
// const AWS = require("aws-sdk");

import {
  TrainModel,
  GenerateImage,
  GenerateImagesFromPack,
} from "common/types";
import { FalAiModel } from "./models/FalAiModel";
const app = express();
app.use(express.json());
import dotenv from "dotenv";
const falAiModel = new FalAiModel();
const USER_ID = "2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
dotenv.config();

// import { Worker, Queue } from "bullmq";
// import redis from "ioredis";
// import fs from "fs";
// import archiver from "archiver";
// import path from "path";
// import { Stream } from "stream";

// const redisConnection = new redis({
//   host: process.env.REDIS_HOST,
//   port: 6379,
// });

// const zipQueue = new Queue("zipTasks", {
//   connection: redisConnection,
// });

// const Zipworker = new Worker("ziptaks", async (job) => {
//   const { filenames, bucketname, outputurl } = job.data;
//   const passthroughstream = new Stream.PassThrough();
//   const archive = archiver("zip", { zlib: { level: 9 } });
//   archiver.pipe(archive);

//   for(filekey of file) {
//     const filestram=s3
//     .GetObjectCommand(bucketname, files)
//     .createReadStream();
//     archive.append(filestram, { name: filekey });
//     await new Promise((resolve) => {
//       archive.finalize(resolve);
//     });

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});
// const s3_2=new AWS.S3({
//   accessKeyId: process.env.S3_ACCESS_KEY!,
//   secretAccessKey: process.env.S3_SECRET_KEY!,
//   region: process.env.REGION,
// })


app.get("/get-presigned-url", async (req, res) => {
  console.log(S3Client);
  const key = `models/${Date.now()}_${Math.random()}.zip` ;
  console.log(key);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `models/${Date.now()}_${Math.random()}.zip`,
    ContentType: "application/zip",
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  res.json({
    url,
    key
  });
});







app.post("/ai/training", async (req, res) => {
  const parsedBody = TrainModel.parse(req.body);
  if (!parsedBody) {
    res.status(411).json({
      message: "Invalid Request Body",
    });
    return;
  }
  const { request_id, response_url } = await falAiModel.trainModel(
    parsedBody.zipUrl,
    parsedBody.name
  );
  res.json({
    message: "Training started successfully",
  });
  const data = await prismaClient.model.create({
    data: {
      name: parsedBody.name,
      type: parsedBody.type,
      age: parsedBody.age,
      ethnecity: parsedBody.ethnecity,
      eyeColor: parsedBody.eyeColor,
      bald: parsedBody.bald,
      userId: USER_ID,
      zipUrl: parsedBody.zipUrl,
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
  const model = await prismaClient.model.findUnique({
    where: {
      id: parsedBody.modelId,
    },
  });
  if (!model || !model.tensorPath) {
    res.status(500).json({
      message: "Model not found or tensor path missing",
    });
    return;
  }

  const { request_id, response_url } = await falAiModel.generateImage(
    parsedBody.prompt,
    model?.tensorPath
  );
  const data = await prismaClient.outputImages.create({
    data: {
      prompt: parsedBody.prompt,
      modelId: parsedBody.modelId,
      userId: USER_ID,
      imageUrl: "",
      falAiRequestId: request_id,
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
let requestIds:{request_id:string}[]=await Promise.all(prompts.map( async (prompt)=>{  
  return await falAiModel.generateImage(prompt.prompt,parsedBody.modelId);
})) ;

  const images = await prismaClient.outputImages.createManyAndReturn({
    data: prompts.map((prompt,index) => ({
      prompt: prompt.prompt,
      userId: USER_ID,
      modelId: parsedBody.modelId,
      imageUrl: "",
      falAiRequestId: requestIds[index].request_id,
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
      tensorPath: req.body.tensor_path,
    },
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
      falAiRequestId: requestId,
    },
    data: {
      status: "generated",
      imageUrl: req.body.image_Url,
    },
  });
  res.json({
    message: "webhook received",
  });
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
