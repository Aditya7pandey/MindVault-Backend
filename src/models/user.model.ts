import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      require: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    googleAuth:{
      type:Boolean,
      default:false
    },
    publicLink: {
      isShared: {
        type: Boolean,
        default: false,
      },
      link: {
        type: String,
      },
    },
    verified:{
      type:Boolean,
      default:false
    },
    verification:{
      code:String,
      expiresAt:Date,
      attempts:{
        type:Number,
        default:0
      }
    }
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
