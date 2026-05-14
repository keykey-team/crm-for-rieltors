"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.getFileUrl = getFileUrl;
exports.deleteFile = deleteFile;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_1 = require("../../../app/config/env");
const s3 = new client_s3_1.S3Client({});
function ensureBucketConfigured() {
    if (!env_1.env.awsBucketName)
        throw new Error('AWS_BUCKET_NAME is not configured');
    return env_1.env.awsBucketName;
}
async function generatePresignedUploadUrl(fileName, contentType, isPublic = false) {
    const bucketName = ensureBucketConfigured();
    const prefix = isPublic ? `${env_1.env.awsFolderPrefix}public/uploads` : `${env_1.env.awsFolderPrefix}uploads`;
    const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType, ContentDisposition: isPublic ? 'attachment' : undefined }), { expiresIn: 3600 });
    return { uploadUrl, cloud_storage_path };
}
async function getFileUrl(cloud_storage_path, isPublic) {
    const bucketName = ensureBucketConfigured();
    if (isPublic)
        return `https://${bucketName}.s3.${env_1.env.awsRegion}.amazonaws.com/${cloud_storage_path}`;
    return (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ResponseContentDisposition: 'attachment' }), { expiresIn: 3600 });
}
async function deleteFile(cloud_storage_path) {
    const bucketName = ensureBucketConfigured();
    await s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}
