import mongoose from "mongoose";

const legalPageSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

const LegalPage = mongoose.model("LegalPage", legalPageSchema);

export default LegalPage;
