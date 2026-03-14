import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    tagName:{
        type:String,
        unique:true,
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:true
    }
},{
    timestamps:true
})

const tagModel = mongoose.model("tag",tagSchema);

export default tagModel;