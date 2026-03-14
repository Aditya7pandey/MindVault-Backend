import type { Request, Response } from "express";
import axios from "axios";
import embedModel from "../models/embed.model.js";
import contentModel from "../models/content.model.js";
import mongoose from "mongoose";
import AiModelCall from "../aiModel/ai.model.js";

const search = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { search } = req.body;
    const userObjectId = new mongoose.Types.ObjectId(req.userId as string);

    const searchQuery = [search];

    // const embed = await axios.post("http://localhost:8000/embed", {
    //   text: searchQuery,
    // });

    const embed = await axios.post("https://adiish-my-embedding-model.hf.space/embed", {
      text: searchQuery,
    });

    const vector = embed.data.vectors[0];

    const hits = await embedModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: vector,
          numCandidates: 100,
          limit: 10,
          filter: {
            userId: userObjectId,
          },
        },
      },
      {
        $project: {
          contentId: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    const contentIds = hits.map((h) => h.contentId);

    const contents = await contentModel
      .find({
        _id: { $in: contentIds },
      })
      .populate({
        path: "userId tags",
        select: "username tagName",
      });

    const arr = [];

    arr.push(contents.toString());

    const str = `This is the query by user and above is the given context ${search}`;

    arr.push(str);

    const result = await AiModelCall(arr.toString());

    return res.status(200).json({
      success: true,
      result: result.text,
      content: contents,
      message: "data fetched successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        message: error.message,
      });
    }
  }
};

export { search };
