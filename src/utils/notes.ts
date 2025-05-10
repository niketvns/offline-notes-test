import axios from "axios";
import {
  storeOfflineNote,
  getOfflineNote,
  getOfflineNotes,
  deleteOfflineNote,
  editOfflineNote,
} from "../../public/indexeddb";
import { INote, SelectOption } from "@/interfaces/global.interface";

function createServerNote(note: INote) {
  const serverNote: INote = {
    title: note.title,
    localId: note.localId,
    createdAt: note.createdAt,
    tags: note.tags,
  };
  return serverNote;
}

export function createNote(noteTitle: string, noteTags: SelectOption[]) {
  const note: INote = {
    title: noteTitle,
    localId: crypto.randomUUID(),
    createdAt: new Date(),
    tags: noteTags,
  };
  return note;
}

export async function submitNote(note: INote) {
  // Store the note in IndexedDB first

  await storeOfflineNote(note);

  // Check if the browser is online
  if (navigator.onLine) {
    // Send a POST request to the save-note endpoint
    try {
      const response = await fetch("/api/save-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createServerNote(note)),
      });

      if (response.ok) {
        await response.json().then(async (data) => {
          // TODO: Candidate should uncomment and potentially adjust this block
          //       once the backend API is implemented and returns a real database ID.
          //       This marks the note as synced by storing the backend ID locally.
          note._id = data.insertedId;
          await editOfflineNote(note);
        });
      } else {
        console.error("Failed to submit note");
      }
    } catch (error) {
      console.error("Failed to submit note:", error);
    }
  }
}

export async function deleteNote(noteId: string) {
  try {
    const note = await getOfflineNote(noteId);
    if (note !== undefined) {
      if (note._id === undefined) {
        await deleteOfflineNote(noteId);
      } else {
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a DELETE request to the API endpoint
          try {
            await deleteOfflineNote(noteId);
            await axios.delete(`/api/delete-note?id=${note._id}`);
          } catch (error) {
            console.error("Error deleting note:", error);
          }
        } else {
          note.localDeleteSynced = false;
          await editOfflineNote(note);
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
}

export async function editNote(
  noteId: string,
  updatedTitle: string,
  updatedTags: SelectOption[]
) {
  try {
    const note = await getOfflineNote(noteId);
    if (note !== undefined) {
      if (note._id === undefined) {
        note.title = updatedTitle;
        note.tags = updatedTags;
        await editOfflineNote(note);
      } else {
        note.localEditSynced = false;
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a PUT request to the API endpoint
          try {
            await axios.put(`/api/edit-note?id=${note._id}`, {
              title: updatedTitle,
              tags: updatedTags,
            });
            note.title = updatedTitle;
            note.tags = updatedTags;
            note.localEditSynced = undefined;
            await editOfflineNote(note);
          } catch (error) {
            console.error("Error editing note:", error);
          }
        } else {
          note.title = updatedTitle;
          note.tags = updatedTags;
          await editOfflineNote(note);
        }
      }
    }
  } catch (error) {
    console.error("Failed to edit note:", error);
  }
}

export async function updateSavedNote(serverNote: INote, localNotes: INote[]) {
  const matchingSyncedLocalNote = localNotes.find(
    (localNote: INote) => localNote._id === serverNote._id
  );
  if (matchingSyncedLocalNote === undefined) {
    const matchingUnsyncedLocalNote = localNotes.find(
      (localNote: INote) => localNote.localId === serverNote.localId
    );
    if (matchingUnsyncedLocalNote !== undefined) {
      matchingUnsyncedLocalNote._id = serverNote._id;
      await editOfflineNote(matchingUnsyncedLocalNote);
    } else {
      serverNote.localId = crypto.randomUUID();
      await storeOfflineNote(serverNote);
    }
  }
}

export async function updateEditedNote(serverNote: INote, localNotes: INote[]) {
  const matchingLocalNote = localNotes.find(
    (localNote: INote) => localNote._id === serverNote._id
  );
  if (matchingLocalNote !== undefined) {
    if (matchingLocalNote.localEditSynced === false) {
      await axios.put(`/api/edit-note?id=${matchingLocalNote._id}`, {
        title: matchingLocalNote.title,
      });
      matchingLocalNote.localEditSynced = undefined;
      await editOfflineNote(matchingLocalNote);
    } else if (matchingLocalNote.localEditSynced === undefined) {
      matchingLocalNote.title = serverNote.title;
      await editOfflineNote(matchingLocalNote);
    }
  }
}

export async function updateDeletedNote(serverId: string, localNotes: INote[]) {
  const matchingLocalNote = localNotes.find(
    (localNote: INote) => localNote._id === serverId
  );
  if (matchingLocalNote !== undefined) {
    await deleteOfflineNote(matchingLocalNote.localId);
  }
}

export async function refreshNotes() {
  if (navigator.onLine) {
    try {
      const localNotes = await getOfflineNotes();
      const response = await axios.get("/api/notes");
      const serverNotes = response.data;

      for (const localNote of localNotes) {
        if (localNote.localDeleteSynced === false) {
          const matchingServerNote = serverNotes.find(
            (serverNote: INote) => localNote._id === serverNote._id
          );
          if (matchingServerNote !== undefined) {
            await deleteOfflineNote(localNote.localId);
            await axios.delete(`/api/delete-note?id=${localNote._id}`);
          }
        } else if (localNote._id === undefined) {
          // Attempt to submit unsynced local note
          try {
            const submittedNoteResponse = await fetch("/api/save-note", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(createServerNote(localNote)),
            });

            if (submittedNoteResponse.ok) {
              console.log(
                `Synced local note ${localNote.localId} during refresh.`
              );
              await submittedNoteResponse.json().then(async (data) => {
                // TODO: Candidate should uncomment and potentially adjust this block
                //       once the backend API is implemented and returns a real database ID.
                localNote._id = data.insertedId;
                await editOfflineNote(localNote);
              });
            } else {
              console.error(
                `Failed to sync local note ${localNote.localId} during refresh:`,
                submittedNoteResponse.statusText
              );
            }
          } catch (error) {
            console.error(
              `Error syncing local note ${localNote.localId} during refresh:`,
              error
            );
          }
        } else if (localNote.localEditSynced === false && localNote._id) {
          // Conflict detection: note was edited locally and also exists on server
          const matchingServerNote = serverNotes.find(
            (serverNote: INote) => serverNote._id === localNote._id
          );

          console.log("localNote: ", localNote);
          console.log("matchingServerNote: ", matchingServerNote);

          if (matchingServerNote) {
            // Check for conflict: updatedAt or content/tags differ
            const isConflict =
              localNote.updatedAt &&
              matchingServerNote.updatedAt &&
              new Date(localNote.updatedAt).getTime() <
                new Date(matchingServerNote.updatedAt).getTime() &&
              (localNote.title !== matchingServerNote.title ||
                JSON.stringify(localNote.tags) !==
                  JSON.stringify(matchingServerNote.tags));
            if (isConflict) {
              console.warn(
                `Conflict detected for note _id=${localNote._id}:\nLocal:`,
                localNote,
                "\nServer:",
                matchingServerNote
              );
              // Here you could trigger a UI or store conflict info for later resolution
            }
          }
        }
      }

      const updatedLocalNotes = await getOfflineNotes();
      const updatedResponse = await axios.get("/api/notes");
      const updatedServerNotes = updatedResponse.data;

      for (const serverNote of updatedServerNotes) {
        updateSavedNote(serverNote, updatedLocalNotes); // make sure to keep into account locally deleted notes
        updateEditedNote(serverNote, updatedLocalNotes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }
}

export async function getNotes() {
  const notes = await getOfflineNotes();
  notes.sort(function (a: INote, b: INote) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return notes;
}
