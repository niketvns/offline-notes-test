import dbConnect from "../../utils/dbConnect";
import Note from "../../models/note.model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const noteData = req.body;

      // Basic validation (optional, but good practice)
      if (
        !noteData ||
        !noteData.title ||
        !noteData.localId ||
        !noteData.createdAt
      ) {
        return res.status(400).json({ error: "Invalid note data" });
      }

      const note = new Note(noteData);

      const savedNote = await note.save();

      if (!savedNote) {
        return res.status(400).json({ error: "Failed to save note" });
      }

      res.status(200).json({ insertedId: savedNote._id });

      // TODO: Implement logic to save the note to your chosen data store.
      // - Connect to the database/data source.
      // - Save the noteData object.
      // - Retrieve the unique identifier assigned by the data store (e.g., MongoDB _id, SQL primary key).
      // - Replace the example response below with the actual assigned identifier.

      // const insertedId = noteData.localId; // Placeholder: Use localId as temporary example ID

      // Respond with the identifier the client expects
      // res.status(200).json({ insertedId: insertedId });
    } catch (error) {
      console.error("Error saving note:", error);
      res.status(500).json({ error: "Failed to save note" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
