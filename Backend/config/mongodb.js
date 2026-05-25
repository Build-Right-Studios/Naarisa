import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected :", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectMongoDB;