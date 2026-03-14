import userModel from "../models/user.model.js";
import type { Request, Response } from "express";
import * as z from "zod";
import { hasUpperAndLower } from "../functions/fun.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../config/sendEmail.config.js";
import admin from 'firebase-admin'

const privateKey = process.env.FIREBASE_PRIVATE_KEY as string

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }),
});

const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const Player = z.object({
      username: z.string().min(3).max(10),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(20)
        .refine((val) => hasUpperAndLower(val), {
          message: "Include both lowercase and uppercase letters",
        }),
    });

    const result = Player.safeParse({ username, email, password });
    if (!result.success) {
      return res.status(411).json({
        error: result.error,
      });
    }

    const exists = await userModel.findOne({ email });

    // email verification code
    if (exists && exists.verified) {
      return res.status(403).json({
        message: "user already exists",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    if (exists && !exists.verified) {
      exists.verification = {
        code: verificationCode,
        expiresAt: expiryTime,
        attempts: 0,
      };

      await exists.save();

      await sendEmail(email, verificationCode);

      return res.status(200).json({
        success: true,
        message: "verify your email address",
        userId: exists._id,
        username: exists.username,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      verification: {
        code: verificationCode,
        expiresAt: expiryTime,
      },
    });

    await sendEmail(email, verificationCode);

    return res.status(200).json({
      message: "verify your email address",
      success: true,
      userId: user._id,
      username: username,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const verify = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(403).json({
        message: "user does'nt exists",
      });
    }

    if (user.verified) {
      return res.status(403).json({
        message: "user is already verified",
      });
    }

    if (!user.verification) {
      return res.status(404).json({
        message: "Invalid request",
      });
    }

    //@ts-ignore
    if (Date.now() > user.verification.expiresAt) {
      return res.json({ message: "OTP expired ! Try registering again" });
    }

    if (user.verification.attempts > 5) {
      return res.json({ message: "All attempts done" });
    }

    if (otp !== user.verification.code) {
      user.verification.attempts += 1;
      await user.save();
      return res.json({ message: "Invalid OTP" });
    }

    user.verified = true;
    //@ts-ignore
    user.verification = undefined;
    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      token:token,
      message: "user verified sucessfully",
      userId: userId,
      userName: user.username,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(501).json({
        error: error.message,
      });
    }
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const Player = z.object({
      username: z.string().min(3).max(10),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(20)
        .refine((val) => hasUpperAndLower(val), {
          message: "Include both lowercase and uppercase letters",
        }),
    });

    const result = Player.safeParse({ username, email, password });
    if (!result.success) {
      return res.status(411).json({
        error: result.error,
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(403).json({
        message: "User does'nt exist",
      });
    }

    const checkPassword = await bcrypt.compare(
      password,
      user.password as string,
    );

    if (!checkPassword) {
      return res.status(403).json({
        message: "email or password is incorrect",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "user logined successfully",
      token:token,
      success: true,
      userId: user._id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "user logged out successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
};

const googleSignup = async (req:Request,res:Response) =>{
  try {
    const {email,username} = req.body;

    const isGoogleUser = await admin.auth().getUserByEmail(email);

    if(!isGoogleUser){
      return res.status(204).json({
        message:"Google login"
      })
    }

    let user = await userModel.findOne({email});

    if(user){
      return res.status(403).json({
        message:"user already exists"
      })
    }

     user = await userModel.create({
        email:email,
        googleAuth:true,
        username:username
    })

    const token = jwt.sign({
      id:user.id.toString()
    },process.env.JWT_SECRET as string,{
      expiresIn:"7d"
    })

    return res.status(200).json({
        success:true,
        token:token,
        message:"google signup succeded"
    })
  } catch (error) {
    if(error instanceof Error){
      return res.status(500).json({
          error:error.message
      })
    }
  }
}

const googleLogin = async (req:Request,res:Response) =>{
    try {

      const {email} = req.body;
      
      const isGoogleUser = await admin.auth().getUserByEmail(email);

    if(!isGoogleUser){
      return res.status(204).json({
        message:"Google login"
      })
    }

    const exist = await userModel.findOne({
        email:email,
        googleAuth:true
    });

    if(!exist){
      return res.status(204).json({
        message:"User does'nt exist, you are not a googleAuth user"
      })
    }

    const token = jwt.sign({
      id:exist.id
    },process.env.JWT_SECRET as string,{
        expiresIn:"7d"
    })

    return res.status(200).json({
        success:true,
        message:"Google login successfully",
        token:token
    })

    } catch (error) {
      if(error instanceof Error){
        return res.status(500).json({
          error:error.message
        })
      }
    }
}

export { signup, login, logout, verify,googleLogin,googleSignup };
