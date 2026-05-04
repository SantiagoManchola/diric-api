import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPEG y PNG"));
    }
  },
});
