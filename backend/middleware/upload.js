import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = (dest) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, `uploads/${dest}`),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, uuidv4() + ext);
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("File type not allowed"), false);
};

export const uploadAvatar = multer({
  storage: storage("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("avatar");
export const uploadOutcome = multer({
  storage: storage("outcomes"),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
}).single("file");
