"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SalesIntentionCatalogController_1 = require("../controllers/SalesIntentionCatalogController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
const controller = new SalesIntentionCatalogController_1.SalesIntentionCatalogController();
router.get('/', (0, asyncHandler_1.asyncHandler)(controller.list.bind(controller)));
exports.default = router;
