"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SalesIntentionCatalogController_1 = require("../controllers/SalesIntentionCatalogController");
const router = (0, express_1.Router)();
const controller = new SalesIntentionCatalogController_1.SalesIntentionCatalogController();
router.get('/', controller.list.bind(controller));
exports.default = router;
