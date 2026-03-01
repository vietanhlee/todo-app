import React, { useState, useRef } from "react";
import { Task, Outcome } from "../../types";
import { useTaskContext } from "../../context/TaskContext";
import toast from "react-hot-toast";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiFileLine,
  RiLinkM,
  RiStickyNoteLine,
  RiExternalLinkLine,
  RiArrowDownSLine,
} from "react-icons/ri";

const OUTCOME_API_BASE = "http://localhost:5000";

interface Props {
  task: Task;
}

const TypeIcon: React.FC<{ type: Outcome["type"] }> = ({ type }) => {
  if (type === "file")
    return <RiFileLine className="text-blue-500" size={15} />;
  if (type === "link") return <RiLinkM className="text-purple-500" size={15} />;
  return <RiStickyNoteLine className="text-amber-500" size={15} />;
};

const TaskOutcomes: React.FC<Props> = ({ task }) => {
  const { addOutcome, removeOutcome } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<"note" | "link" | "file">("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setAdding(false);
    setType("note");
    setTitle("");
    setContent("");
    setFile(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && type !== "file") return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("title", title || (file?.name ?? "Untitled"));
      form.append("content", content);
      if (file) form.append("file", file);
      await addOutcome(task._id, form);
      toast.success("Outcome added");
      reset();
    } catch {
      toast.error("Failed to add outcome");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (outcomeId: string) => {
    try {
      await removeOutcome(task._id, outcomeId);
      toast.success("Removed");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
      >
        <RiArrowDownSLine
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          size={15}
        />
        Outcomes ({task.outcomes?.length ?? 0})
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 fade-up">
          {(task.outcomes ?? []).map((o) => (
            <div
              key={o._id}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 group text-sm"
            >
              <TypeIcon type={o.type} />
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300 font-medium">
                {o.title}
              </span>
              {o.type === "note" && o.content && (
                <span className="text-gray-400 text-xs truncate max-w-[120px]">
                  {o.content}
                </span>
              )}
              {o.type === "link" && o.content && (
                <a
                  href={o.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline flex items-center gap-0.5"
                >
                  <RiExternalLinkLine size={12} />
                </a>
              )}
              {o.type === "file" && o.filePath && (
                <a
                  href={`${OUTCOME_API_BASE}${o.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline flex items-center gap-0.5 text-xs"
                >
                  Download
                </a>
              )}
              <button
                onClick={() => handleRemove(o._id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all ml-1"
              >
                <RiDeleteBinLine size={13} />
              </button>
            </div>
          ))}

          {/* Add form */}
          {adding ? (
            <form
              onSubmit={handleAdd}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2 fade-up border border-gray-200 dark:border-gray-700"
            >
              {/* Type tabs */}
              <div className="flex gap-1">
                {(["note", "link", "file"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize transition-colors ${type === t ? "bg-primary-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {type !== "file" && (
                <input
                  className="input text-sm py-1"
                  placeholder="Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              )}

              {type === "note" && (
                <textarea
                  className="input text-sm py-1 resize-none"
                  rows={2}
                  placeholder="Note content…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
              {type === "link" && (
                <input
                  className="input text-sm py-1"
                  placeholder="https://…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
              {type === "file" && (
                <div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-ghost text-xs py-1"
                  >
                    {file ? file.name : "Choose file…"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={reset}
                  className="btn-ghost text-xs py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs py-1 px-3"
                >
                  {loading ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors mt-1"
            >
              <RiAddLine size={13} /> Add outcome
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskOutcomes;
