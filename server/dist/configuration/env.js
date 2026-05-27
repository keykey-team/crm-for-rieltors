"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const defaultClientUrls = ['http://localhost:3000', 'http://localhost:3001'];
function getRequired(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing required environment variable: ${name}`);
    return value;
}
function getClientUrls() {
    const rawValue = process.env.CLIENT_URL;
    if (!rawValue) {
        return defaultClientUrls;
    }
    return rawValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}
const clientUrls = getClientUrls();
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    clientUrl: clientUrls[0] ?? defaultClientUrls[0],
    clientUrls,
    databaseUrl: getRequired('DATABASE_URL'),
    jwtSecret: getRequired('JWT_SECRET'),
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    awsBucketName: process.env.AWS_BUCKET_NAME ?? '',
    awsFolderPrefix: process.env.AWS_FOLDER_PREFIX ?? '',
};
