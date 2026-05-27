"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../common/infrastructure/db/prisma");
const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@local.crm';
const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
async function main() {
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.upsert({
        where: { email },
        create: {
            id: 'local-super-admin',
            email,
            password: hashedPassword,
            name,
            role: 'admin',
            accountType: 'agency',
            plan: 'business',
            permissions: null,
        },
        update: {
            password: hashedPassword,
            name,
            role: 'admin',
            accountType: 'agency',
            plan: 'business',
            permissions: null,
        },
        select: {
            id: true,
            email: true,
            role: true,
            accountType: true,
            plan: true,
        },
    });
    console.log(`Super admin ready: ${user.email} (${user.role}, ${user.accountType}, ${user.plan})`);
}
main()
    .catch((error) => {
    console.error('Failed to ensure super admin');
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
