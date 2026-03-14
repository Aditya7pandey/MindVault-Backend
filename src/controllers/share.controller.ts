import type { Request, Response } from "express";
import crypto, { randomUUID } from "crypto";
import contentModel from "../models/content.model.js";
import userModel from "../models/user.model.js";

const share = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const shareLink = `http://localhost:3000/api/v1/share/${crypto.randomUUID()}`;
    if (!userId) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    const { share } = req.body;

    if (share) {
      const updateUser = await userModel.updateOne(
        { _id: userId },
        {
          $set: {
            publicLink: {
              isShared: true,
              link: shareLink,
            },
          },
        },
      );

      if (!updateUser) {
        return res.status(404).json({
          message: "No updation exists",
        });
      }

      return res.status(200).json({
        success: true,
        message: "MindVault is public now",
        publicLink: shareLink,
      });
    }

    const updateUser = await userModel.updateOne(
      { _id: userId },
      {
        $set: {
          publicLink: {
            isShared: false,
            link: "",
          },
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "sharing disabled",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const sharedValult = async (req: Request, res: Response) => {
  try {
    const { link } = req.params;

    const generatedLink = `http://localhost:3000/api/v1/share/${link}`;

    if (!link) {
      return res.status(404).json({
        message: "Invalid request no link provided",
      });
    }

    const user = await userModel.findOne({
      "publicLink.isShared": true,
      "publicLink.link": generatedLink,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    const content = await contentModel.find({ userId: user._id }).populate({
      path: "tags",
      select: "tagName",
    });

    return res.status(200).json({
      success: true,
      username: user.username,
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

const getShareStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }

    const user = await userModel.findById(userId).select("publicLink");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      isShared: user.publicLink?.isShared || false,
      publicLink: user.publicLink?.link || null,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

export { share, sharedValult, getShareStatus };
