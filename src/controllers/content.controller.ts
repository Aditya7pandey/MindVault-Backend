import type { Request, Response } from "express";
import * as z from "zod";
import contentModel from "../models/content.model.js";
import tagModel from "../models/tags.model.js";
import type { Types } from "mongoose";
import crypto from "crypto";
import axios from "axios";
import embedModel from "../models/embed.model.js";

const createContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    const { type, link, title, tags } = req.body;

    const Player = z.object({
      type: z.string(),
      link: z.string(),
      title: z.string().min(3),
      tags: z.array(z.string()),
    });

    const result = Player.safeParse({ type, link, title, tags });

    if (!result.success) {
      return res.status(411).json({
        error: result.error,
      });
    }

    let tagIds: Types.ObjectId[] = [];

    for (let tagTitle of tags) {
      // pehle check karo tag already hai ya nahi
      let tag = await tagModel.findOne({
        tagName: tagTitle,
      });

      // agar nahi hai → naya tag banao
      if (!tag) {
        tag = await tagModel.create({
          tagName: tagTitle,
          userId: userId,
        });
      }

      tagIds.push(tag._id);
    }

    const content = await contentModel.create({
      title,
      link,
      type,
      userId,
      tags: tagIds,
    });

    const tagNames = tags.toString();

    const textToEmbed = [title, type, tagNames];

    // const embedResponse = await axios.post("http://localhost:8000/embed", {
    //   text: textToEmbed,
    // });

    const embedResponse = await axios.post("https://adiish-my-embedding-model.hf.space/embed", {
      text: textToEmbed,
    });

    if (!embedResponse) {
      await contentModel.deleteOne({ _id: content._id });

      return res.status(501).json({
        error: "Server 2 crashed",
      });
    }

    const embedding = embedResponse.data.vectors[0];

    await embedModel.create({
      userId: userId,
      contentId: content._id,
      embedding: embedding,
    });

    return res.status(200).json({
      message: "Content created successfully",
      success: true,
      contentId: content._id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const deleteContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { contentId } = req.params;

    if (!userId || !contentId) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    const content = await contentModel.deleteOne({
      userId: userId,
      _id: contentId,
    });

    if (!content) {
      return res.status(400).json({
        message: "something went wrong",
      });
    }

    return res.status(200).json({
      success: true,
      message: "content deleted successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const getContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    const content = await contentModel.find({ userId }).populate({
      path: "userId tags",
      select: "username tagName",
    });

    return res.status(200).json({
      message: "content retreived successfully",
      success: true,
      content: content,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const getTags = async (req: Request, res: Response) => {
  try {
    const allTags = await tagModel.find({});

    return res.status(200).json({
      message: "All tags fetched",
      success: true,
      tags: allTags,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const getTweet = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    const contents = await contentModel.find({
      userId,
      type: "tweet",
    });

    return res.status(200).json({
      message: "data fetched successfully",
      success: true,
      content: contents,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        error: error.message,
      });
    }
  }
};

const getDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    const contents = await contentModel.find({
      userId,
      type: "document",
    });

    return res.status(200).json({
      message: "data fetched successfully",
      success: true,
      content: contents,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        error: error.message,
      });
    }
  }
};

const getLinks = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    const contents = await contentModel.find({
      userId,
      type: "link",
    });

    return res.status(200).json({
      message: "data fetched successfully",
      success: true,
      content: contents,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        error: error.message,
      });
    }
  }
};

const getYoutube = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    const contents = await contentModel.find({
      userId,
      type: "youtube",
    });

    return res.status(200).json({
      message: "data fetched successfully",
      success: true,
      content: contents,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        error: error.message,
      });
    }
  }
};

const updateContent = async (req:Request,res:Response) =>{
    try {
      const userId = req.userId;
      const {contentId,title,link,type,tags} = req.body;

      if(!userId || !contentId){
        return res.status(401).json({
          message:"Invalid request",
        })
      }

      let tagIds: Types.ObjectId[] = [];

    for (let tagTitle of tags) {
      // pehle check karo tag already hai ya nahi
      let tag = await tagModel.findOne({
        tagName: tagTitle,
      });

      // agar nahi hai → naya tag banao
      if (!tag) {
        tag = await tagModel.create({
          tagName: tagTitle,
          userId: userId,
        });
      }

      tagIds.push(tag._id);
    }

    const content = await contentModel.updateOne({
        userId:userId,
        _id:contentId,
      },{
        title:title,
        link:link,
        type:type,
        tags:tagIds,
      })

    const tagNames = tags.toString();

    const textToEmbed = [title, type, tagNames];

    const embedResponse = await axios.post("https://adiish-my-embedding-model.hf.space/embed", {
      text: textToEmbed,
    });

    if (!embedResponse) {
      await contentModel.deleteOne({ _id: contentId});

      return res.status(501).json({
        error: "Server 2 crashed",
      });
    }

    const embedding = embedResponse.data.vectors[0];

      // updating embeddings

      await embedModel.updateOne({
        userId:userId,
        contentId:contentId
      },{
        embedding:embedding
      })

      return res.status(200).json({
        message:"content updated successfully",
        success:true,
        content:content,
      })
    } catch (error) {
      if(error instanceof Error){
        return res.status(501).json({
          error:error.message,
        })
      }
    }
}

export {
  createContent,
  deleteContent,
  getContent,
  getTags,
  getTweet,
  getDocument,
  getLinks,
  getYoutube,
  updateContent
};
