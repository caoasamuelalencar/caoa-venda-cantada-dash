"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionCatalogService = void 0;
const SalesIntentionCatalogRepository_1 = require("../repositories/SalesIntentionCatalogRepository");
class SalesIntentionCatalogService {
    constructor() {
        this.repository = new SalesIntentionCatalogRepository_1.SalesIntentionCatalogRepository();
    }
    async listAll() {
        return this.repository.findAll();
    }
}
exports.SalesIntentionCatalogService = SalesIntentionCatalogService;
