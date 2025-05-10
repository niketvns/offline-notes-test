import React from "react";
import { selectOptions } from "./NoteForm";
import { useAppContext } from "@/store/appContext";

const TagFilter: React.FC = () => {
  const { selectedTags, handleSelectedTags } = useAppContext();

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (e.target.name === "all") {
        handleSelectedTags(["all"]);
      } else {
        handleSelectedTags([
          ...selectedTags.filter((tag) => tag !== "all"),
          e.target.name,
        ]);
      }
    } else {
      handleSelectedTags([
        ...selectedTags.filter((tag) => tag !== e.target.name),
      ]);
    }
  };

  return (
    <div className="w-full flex flex-wrap items-center gap-3">
      <b className="text-sm md:text-lg">Filter: </b>
      <label
        htmlFor="all"
        className="flex gap-2 items-center text-sm md:text-base xl:text-lg px-4 py-1 bg-gray-200 rounded-full cursor-pointer select-none"
      >
        <input
          type="checkbox"
          name="all"
          id="all"
          className="h-4 w-4 cursor-pointer"
          onChange={handleFilterChange}
          checked={selectedTags.includes("all") || selectedTags.length === 0}
        />
        <span>All</span>
      </label>
      {selectOptions.map((option) => (
        <div key={option.value}>
          <label
            htmlFor={option.value}
            className="flex gap-2 items-center text-sm md:text-base xl:text-lg px-4 py-1 bg-gray-200 rounded-full cursor-pointer select-none"
          >
            <input
              type="checkbox"
              name={option.value}
              id={option.value}
              className="h-4 w-4 cursor-pointer"
              onChange={handleFilterChange}
              checked={selectedTags.includes(option.value)}
            />
            <span>{option.label}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default TagFilter;
