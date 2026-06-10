"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionController = void 0;
const SalesIntentionService_1 = require("../services/SalesIntentionService");
const service = new SalesIntentionService_1.SalesIntentionService();
class SalesIntentionController {
    async list(req, res) {
        const records = await service.listAll();
        res.json(records);
    }
    async getById(req, res) {
        const id = Number(req.params.id);
        const record = await service.getById(id);
        if (!record) {
            res.status(404).json({ message: 'Registro não encontrado.' });
            return;
        }
        res.json(record);
    }
    async create(req, res) {
        const record = await service.create(req.body);
        res.status(201).json(record);
    }
    async update(req, res) {
        const id = Number(req.params.id);
        const record = await service.update(id, req.body);
        res.json(record);
    }
    async delete(req, res) {
        const id = Number(req.params.id);
        await service.remove(id);
        res.status(204).send();
    }
}
exports.SalesIntentionController = SalesIntentionController;
