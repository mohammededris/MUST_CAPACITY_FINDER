import mongoose from "mongoose";
const Schema = mongoose.Schema;

const alldataSchema = new Schema({
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
  courseReferenceNumber: { type: String, required: true },
});

const Alldata = mongoose.model("Alldata", alldataSchema);

export { Alldata as Alldata };
