"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionController = void 0;
const SalesIntentionService_1 = require("../services/SalesIntentionService");
const service = new SalesIntentionService_1.SalesIntentionService();
function parseIdParam(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
class SalesIntentionController {
    async list(req, res) {
        const records = await service.listAll();
        res.json(records);
    }
    async getById(req, res) {
        const id = parseIdParam(req.params.id);
        if (!id) {
            res.status(400).json({ message: 'ID inválido.' });
            return;
        }
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
        const id = parseIdParam(req.params.id);
        if (!id) {
            res.status(400).json({ message: 'ID inválido.' });
            return;
        }
        const record = await service.update(id, req.body);
        if (!record) {
            res.status(404).json({ message: 'Registro não encontrado.' });
            return;
        }
        res.json(record);
    }
    async delete(req, res) {
        const id = parseIdParam(req.params.id);
        if (!id) {
            res.status(400).json({ message: 'ID inválido.' });
            return;
        }
        const removed = await service.remove(id);
        if (!removed) {
            res.status(404).json({ message: 'Registro não encontrado.' });
            return;
        }
        res.status(204).send();
    }
}
exports.SalesIntentionController = SalesIntentionController;
