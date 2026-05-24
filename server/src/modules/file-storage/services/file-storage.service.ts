import { generatePresignedUploadUrl, getFileUrl } from '../../../common/infrastructure/storage/s3';
import { badRequest } from '../../../common/shared-kernel/errors';
import { PresignedUploadInput } from '../models/file-storage.dto';

function requiredString(value: unknown, field: string): string {
  const result = String(value ?? '').trim();
  if (!result) throw badRequest(`${field} required`);
  return result;
}

export async function createPresignedUpload(input: PresignedUploadInput) {
  return generatePresignedUploadUrl(
    requiredString(input.fileName, 'fileName'),
    requiredString(input.contentType, 'contentType'),
    Boolean(input.isPublic ?? true),
  );
}

export async function resolveFileUrl(pathInput: unknown) {
  const path = requiredString(pathInput, 'path');
  return getFileUrl(path, path.includes('/public/'));
}

