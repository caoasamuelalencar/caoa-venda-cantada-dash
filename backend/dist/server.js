"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
app_1.default.listen(env_1.env.PORT, () => {
    console.log(`Backend rodando em http://localhost:${env_1.env.PORT} usando ${env_1.env.DATABASE_PROVIDER}`);
});
