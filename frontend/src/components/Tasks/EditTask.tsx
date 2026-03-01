import React, { useState } from "react";
import { Task, Priority } from "../../types";
import { useTaskContext } from "../../context/TaskContext";
import { RiCloseLine } from "react-icons/ri";
import { format } from "date-fns";
import AutocompleteInput from "../UI/AutocompleteInput";
import TagInput from "../UI/TagInput";

interface Props {
  task: Task;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];

const EditTask: React.FC<Props> = ({ task, onClose }) => {
  const { updateTask, categories, allTags } = useTaskContext();
  const [title, setTitle]       = useState(task.title);
  const [description, setDesc]  = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate]   = useState(
    task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
  );
  const [category, setCategory] = useState(task.category ?? "");
  const [tags, setTags]         = useState<string[]>(task.tags ?? []);
  const [notes, setNotes]       = useState(task.notes ?? "");
  const [loading, setLoading]   = useState(false);

  const catSuggestions = categories.filter((c) => c !== "All");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTask(task._id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        category: category.trim() || "General",
        tags,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <RiCloseLine size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Title"
          />
          <textarea
            className="input resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select
                className="input capitalize"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
              <input
                className="input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <AutocompleteInput
              value={category}
              onChange={setCategory}
              suggestions={catSuggestions}
              placeholder="Category"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</label>
            <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
          </div>

          <textarea
            className="input resize-none text-sm"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
          />

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
