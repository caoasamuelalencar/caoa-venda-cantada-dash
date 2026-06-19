"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: env_1.env.DATABASE_URL
        }
    }
});
exports.default = prisma;
