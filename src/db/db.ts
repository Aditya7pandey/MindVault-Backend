import mongoose from "mongoose";

const connectDb = async()=>{
    if(!process.env.MONGODB_URI){
        throw new Error("mongodb secret missing");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongodb connected");
}

export default connectDb;