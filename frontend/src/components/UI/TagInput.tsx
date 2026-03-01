import React, { useState, useRef, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add tags…",
}) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addTag = (t: string) => {
    const tag = t.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
    setOpen(false);
  };

  const removeTag = (t: string) => onChange(tags.filter((x) => x !== t));

  return (
    <div ref={ref} className="relative">
      <div className="input min-h-[36px] flex flex-wrap gap-1 items-center py-1">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full"
          >
            #{t}
            <button type="button" onClick={() => removeTag(t)}>
              <RiCloseLine size={11} />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder-gray-400"
          placeholder={tags.length === 0 ? placeholder : ""}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && input.trim()) {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === "Backspace" && !input && tags.length) {
              removeTag(tags[tags.length - 1]);
            }
          }}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg text-sm overflow-hidden">
          {filtered.slice(0, 6).map((s) => (
            <li
              key={s}
              onMouseDown={() => addTag(s)}
              className="px-3 py-2 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300"
            >
              #{s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
