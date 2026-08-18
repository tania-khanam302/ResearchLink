import { Thesis } from "../models/thesis.js";

export const getAllTheses = async () => {
  return await Thesis.find()
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
};
