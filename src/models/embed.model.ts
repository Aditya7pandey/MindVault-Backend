import mongoose from "mongoose";

const embedSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:true
    },
    contentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"content",
        require:true
    },
    embedding:{
        type:[Number],
        require:true
    }
})

const embedModel = mongoose.model("embed",embedSchema);

export default embedModel;