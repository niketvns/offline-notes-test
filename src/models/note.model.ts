import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    localId: {
      type: String,
    },
    localDeleteSynced: {
      type: Boolean,
    },
    localEditSynced: {
      type: Boolean,
    },
    tags: {
      type: [
        {
          value: String,
          label: String,
          color: String,
        },
      ],
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

export default Note;
