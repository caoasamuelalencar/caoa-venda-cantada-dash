"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionCatalogController = void 0;
const SalesIntentionCatalogService_1 = require("../services/SalesIntentionCatalogService");
const service = new SalesIntentionCatalogService_1.SalesIntentionCatalogService();
class SalesIntentionCatalogController {
    async list(_req, res) {
        const records = await service.listAll();
        res.json(records);
    }
}
exports.SalesIntentionCatalogController = SalesIntentionCatalogController;
