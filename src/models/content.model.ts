import mongoose from "mongoose";
import { boolean } from "zod";

const contentSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:["document","tweet","youtube","link"],
        require:true
    },
    link:{
        type:String,
        // require:true
    },
    title:{
        type:String,
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require:true
    },
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tag',
        require:true
    }],
},{
    timestamps:true
})

const contentModel = mongoose.model("content",contentSchema);

export default contentModel;
