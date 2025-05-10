import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Heading } from "../styles/styled";
import { SpinnerContainer } from "./LoadingSpinner";
import {
  createNote,
  submitNote,
  deleteNote,
  editNote,
  refreshNotes,
  getNotes,
} from "../utils/notes";

import styled from "styled-components";

import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";
import OfflineIndicator from "./OfflineIndicator";
import { INote, SelectOption } from "@/interfaces/global.interface";
import TagFilter from "./TagFilter";
import { useAppContext } from "@/store/appContext";

const NoteListLoadingSpinner = styled(SpinnerContainer)`
  margin-top: 20px;
  margin-bottom: 10px;
  margin-inline: auto;
`;

export default function NoteList() {
  const [allNotes, setAllNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedTags, handleSelectedTags } = useAppContext();

  const handleNoteSubmit = useCallback(
    async (noteTitle: string, noteTags: SelectOption[]) => {
      const note: INote = createNote(noteTitle, noteTags);
      await submitNote(note);
      setAllNotes(await getNotes());
    },
    []
  );

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId);
    setAllNotes(await getNotes());
  }, []);

  const handleEditNote = useCallback(
    async (
      noteId: string,
      updatedTitle: string,
      updatedTags?: SelectOption[]
    ) => {
      await editNote(noteId, updatedTitle, updatedTags || []);
      setAllNotes(await getNotes());
    },
    []
  );

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      await refreshNotes();
      setAllNotes(await getNotes());
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Listen for the "online" event to trigger sync
          window.addEventListener("online", async () => {
            registration.sync
              .register("sync-notes")
              .then(() => {
                console.log("Sync event registered");
              })
              .catch((error) => {
                console.error("Sync event registration failed:", error);
              });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    window.addEventListener("online", async () => {
      await fetchNotes();
    });
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    if (selectedTags.length === 0 || selectedTags.includes("all")) {
      return allNotes;
    }
    return allNotes?.filter((note) =>
      note?.tags?.some((tag) => selectedTags.includes(tag.value))
    );
  }, [allNotes, selectedTags]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 self-center w-full my-4">
      <Heading>Notes</Heading>
      <div className="flex flex-col gap-4 items-stretch self-center w-full">
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        <div className="flex flex-col gap-4 items-stretch self-center w-full p-4 max-w-4xl">
          {allNotes?.length > 0 && <TagFilter />}
          {loading && <NoteListLoadingSpinner />}
          {filteredNotes?.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.localId}
                  note={note}
                  onDeleteNote={handleNoteDelete}
                  onEditNote={handleEditNote}
                />
              ))}
            </ul>
          ) : allNotes?.length > 0 ? (
            <div className="flex flex-col gap-4 items-start self-center w-full p-4 max-w-4xl">
              <p>
                No notes found for selected tag{" "}
                <b className="capitalize">{selectedTags.join(", ")}</b>
              </p>
              <button
                className="bg-red-600 text-white px-4 py-1 rounded-md"
                onClick={() => handleSelectedTags(["all"])}
              >
                Clear Filter
              </button>
            </div>
          ) : (
            !loading && (
              <div className="flex gap-4 items-center justify-center w-full p-4 max-w-4xl">
                <p>No notes found, Add a note to get started.</p>
              </div>
            )
          )}
        </div>
      </div>
      <OfflineIndicator />
    </div>
  );
}
