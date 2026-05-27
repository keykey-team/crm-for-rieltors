import { createPresignedUpload, resolveFileUrl } from '../services/file-storage.service';

export const fileStorageFacade = {
  createPresignedUpload,
  resolveFileUrl,
};

