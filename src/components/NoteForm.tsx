import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "../styles/styled";
import Select, { MultiValue } from "react-select";
import { SelectOption } from "@/interfaces/global.interface";
import { useAppContext } from "@/store/appContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export const selectOptions: readonly SelectOption[] = [
  { value: "study", label: "Study", color: "#5243AA" },
  { value: "work", label: "Work", color: "#0052CC" },
  { value: "note", label: "Note", color: "#00B8D9" },
];

const AddNoteButton = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

interface NoteFormProps {
  onNoteSubmit: (noteTitle: string, noteTags: SelectOption[]) => Promise<void>;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteSubmit }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTags, setNoteTags] = useState<SelectOption[]>([]);
  const { handleSelectedTags } = useAppContext();
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
    setSyncing(true);
    await onNoteSubmit(noteTitle.trim(), noteTags);
    setSyncing(false);
    setNoteTitle("");
    setNoteTags([]);
    handleSelectedTags(["all"]);
    setError(null);
  };

  const handleTagChange = (tags: MultiValue<SelectOption>) => {
    setNoteTags((prevTags) => [...tags]);
  };

  return (
    <form
      className="flex flex-col gap-2 items-stretch self-center w-full max-w-md"
      onSubmit={handleSubmit}
    >
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
        {isSyncing ? <LoadingSpinner /> : "Add Note"}
      </AddNoteButton>
    </form>
  );
};

export default NoteForm;
