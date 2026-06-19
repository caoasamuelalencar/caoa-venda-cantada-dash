"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionService = void 0;
const SalesIntentionRepository_1 = require("../repositories/SalesIntentionRepository");
class SalesIntentionService {
    constructor() {
        this.repository = new SalesIntentionRepository_1.SalesIntentionRepository();
    }
    async listAll() {
        return this.repository.findAll();
    }
    async getById(id) {
        return this.repository.findById(id);
    }
    async create(payload) {
        return this.repository.create(payload);
    }
    async update(id, payload) {
        const record = await this.repository.findById(id);
        if (!record) {
            return null;
        }
        return this.repository.update(id, payload);
    }
    async remove(id) {
        const record = await this.repository.findById(id);
        if (!record) {
            return false;
        }
        return this.repository.delete(id);
    }
}
exports.SalesIntentionService = SalesIntentionService;
