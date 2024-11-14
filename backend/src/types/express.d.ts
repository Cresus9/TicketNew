// src/types/express.d.ts

import { Multer } from 'multer';

declare global {
  namespace Express {
    export interface Request {
      file: Multer.File;
      files: Multer.File[];
    }
  }
}
