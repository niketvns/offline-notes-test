import { INote, SelectOption } from "@/interfaces/global.interface";
import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "../styles/styled";
import Select, { MultiValue } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faInfo,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

export const selectOptions: readonly SelectOption[] = [
  { value: "study", label: "Study", color: "#5243AA" },
  { value: "work", label: "Work", color: "#0052CC" },
  { value: "note", label: "Note", color: "#00B8D9" },
];

interface EditNoteProps {
  note: INote;
  closeEditNote: () => void;
  onEditNote: (
    noteId: string,
    updatedTitle: string,
    updatedTags?: SelectOption[]
  ) => Promise<void>;
}

const AddNoteButton = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

export default function EditNote({
  note,
  closeEditNote,
  onEditNote,
}: EditNoteProps) {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState(note.title ?? "");
  const [noteTags, setNoteTags] = useState<SelectOption[]>(note.tags || []);
  const [error, setError] = useState<string | null>(null);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
    if (event.target.value.trim() === "") {
      setError("Title cannot be empty");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteTitle.trim() === "") {
      setError("Title cannot be empty");
      return;
    }
    if (note.localId !== undefined) {
      setSyncing(true);
      await onEditNote(note.localId, noteTitle.trim(), noteTags);
      setSyncing(false);
      setNoteTitle("");
      setNoteTags([]);
      closeEditNote();
      setError(null);
    }
  };

  const handleTagChange = (tags: MultiValue<SelectOption>) => {
    setNoteTags((prevTags) => [...tags]);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center z-10">
      <button
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0"
        onClick={closeEditNote}
      />
      <form
        className="flex flex-col gap-3 items-stretch self-center w-full max-w-md z-10 bg-white rounded-md p-8 min-h-80 max-h-96 relative"
        onSubmit={handleSubmit}
      >
        <button className="absolute top-1 right-1" onClick={closeEditNote}>
          <FontAwesomeIcon
            icon={faClose}
            className="text-black hover:bg-gray-300 p-2 rounded-full"
          />
        </button>
        <h2 className="text-xl font-semibold text-gray-500 text-center">
          Edit Your Note
        </h2>
        <div>
          <textarea
            className={`h-24 w-full resize-vertical mr-4 p-4 border border-gray-300 rounded-md text-md flex-grow outline-blue-500 ${
              error && "border-red-500 outline-red-500"
            }`}
            rows={3}
            value={noteTitle}
            onChange={handleNoteTitleChange}
            placeholder="Enter your note..."
          />
          {error && (
            <p className="text-red-500 flex items-center gap-1">
              <FontAwesomeIcon
                icon={faInfoCircle}
                size={"1x"}
                className="text-red-500"
              />
              {error}
            </p>
          )}
        </div>
        <Select
          isMulti
          name="colors"
          options={selectOptions}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={handleTagChange}
          value={noteTags}
          placeholder="Select tags..."
        />
        <AddNoteButton type="submit">
          {isSyncing ? <LoadingSpinner /> : "Update Note"}
        </AddNoteButton>
      </form>
    </div>
  );
}
