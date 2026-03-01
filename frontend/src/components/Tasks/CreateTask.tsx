import React, { useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  RiAddLine,
  RiCalendarLine,
  RiFlagLine,
  RiPriceTag3Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import AutocompleteInput from "../UI/AutocompleteInput";
import TagInput from "../UI/TagInput";

const PRIORITIES = [
  {
    value: "high",
    label: "High",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-300 dark:border-red-700",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-300 dark:border-amber-700",
  },
  {
    value: "low",
    label: "Low",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-300 dark:border-green-700",
  },
];

/* ── CreateTask ───────────────────────────────────────────────────── */
const CreateTask: React.FC = () => {
  const { addTask, categories, allTags } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  const catSuggestions = categories.filter((c) => c !== "All");

  const reset = () => {
    setTitle("");
    setDesc("");
    setPriority("medium");
    setDueDate("");
    setCategory("");
    setTags([]);
    setShowExtra(false);
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addTask({
        title: title.trim(),
        description: desc.trim(),
        priority,
        dueDate: dueDate || undefined,
        category: category.trim() || undefined,
        tags,
      });
      toast.success("Task created!");
      reset();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:hover:border-primary-600 transition-colors group"
      >
        <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
          <RiAddLine size={16} />
        </span>
        <span className="text-sm font-medium">Add a task…</span>
      </button>
    );
  }

  return (
    <div className="card p-4 fade-up">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 text-sm font-medium text-gray-900 dark:text-white bg-transparent placeholder-gray-400 outline-none"
            placeholder="Task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") reset();
            }}
          />
        </div>
        <textarea
          className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent placeholder-gray-400 outline-none resize-none ml-8 mb-3"
          rows={2}
          placeholder="Add description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="ml-8 mb-3 flex items-center gap-2 flex-wrap">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value as any)}
              className={clsx(
                "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all",
                priority === p.value
                  ? `${p.bg} ${p.border} ${p.color}`
                  : "border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300",
              )}
            >
              <RiFlagLine className="inline mr-1" size={11} />
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-8 mb-3 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <RiCalendarLine size={14} />
            <span>Due</span>
          </label>
          <input
            type="date"
            className="input py-1 text-sm w-auto"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowExtra((v) => !v)}
          className="ml-8 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-3 transition-colors"
        >
          {showExtra ? (
            <RiArrowUpSLine size={14} />
          ) : (
            <RiArrowDownSLine size={14} />
          )}
          {showExtra ? "Less options" : "More options (category, tags)"}
        </button>
        {showExtra && (
          <div className="ml-8 space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <RiPriceTag3Line
                size={14}
                className="text-gray-400 flex-shrink-0"
              />
              <AutocompleteInput
                value={category}
                onChange={setCategory}
                suggestions={catSuggestions}
                placeholder="Category"
              />
            </div>
            <div className="flex items-start gap-2">
              <RiPriceTag3Line
                size={14}
                className="text-gray-400 flex-shrink-0 mt-2"
              />
              <div className="flex-1">
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  suggestions={allTags}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 mt-1">
          <button type="button" onClick={reset} className="btn-ghost text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
