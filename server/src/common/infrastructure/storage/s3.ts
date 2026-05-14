import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../../app/config/env';

const s3 = new S3Client({});

function ensureBucketConfigured(): string {
  if (!env.awsBucketName) throw new Error('AWS_BUCKET_NAME is not configured');
  return env.awsBucketName;
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const bucketName = ensureBucketConfigured();
  const prefix = isPublic ? `${env.awsFolderPrefix}public/uploads` : `${env.awsFolderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType, ContentDisposition: isPublic ? 'attachment' : undefined }), { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloud_storage_path: string, isPublic: boolean) {
  const bucketName = ensureBucketConfigured();
  if (isPublic) return `https://${bucketName}.s3.${env.awsRegion}.amazonaws.com/${cloud_storage_path}`;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ResponseContentDisposition: 'attachment' }), { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string) {
  const bucketName = ensureBucketConfigured();
  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}
