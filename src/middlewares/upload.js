import multer from 'multer';
import { extname as _extname } from 'path';

const storage = multer.memoryStorage();

function checkFileType(file, cb) {


  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const extname = _extname(file.originalname).toLowerCase().replace('.', '');
  const isValidExt = allowedExtensions.includes(extname);
  const isValidMime = allowedMimeTypes.includes(file.mimetype);

  if (isValidExt && isValidMime) {
    return cb(null, true);
  }

  const error = new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed');
  error.statusCode = 400;

  return cd(error, false);
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: checkFileType
});


