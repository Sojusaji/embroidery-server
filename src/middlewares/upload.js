import multer from 'multer';
import { extname as _extname } from 'path';

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

export const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});


