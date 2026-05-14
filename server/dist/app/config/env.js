"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getRequired(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required environment variable: ${name}`);
    return v;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
    databaseUrl: getRequired('DATABASE_URL'),
    jwtSecret: getRequired('JWT_SECRET'),
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    awsBucketName: process.env.AWS_BUCKET_NAME ?? '',
    awsFolderPrefix: process.env.AWS_FOLDER_PREFIX ?? ''
};
