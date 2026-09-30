import request from "supertest";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { salesService } = vi.hoisted(() => ({ salesService: {
  listAll: vi.fn(), search: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
} }));

vi.mock("./services/SalesIntentionService", () => ({ SalesIntentionService: class { listAll = salesService.listAll; search = salesService.search; getById = salesService.getById; create = salesService.create; update = salesService.update; remove = salesService.remove; } }));
vi.mock("./services/SalesIntentionCatalogService", () => ({ SalesIntentionCatalogService: class { listAll = vi.fn(); } }));
vi.mock("./services/SalesIntentionClassificacaoVendaService", () => ({ SalesIntentionClassificacaoVendaService: class { listAll = vi.fn(); } }));
vi.mock("./services/SalesIntentionModelosDealerService", () => ({ SalesIntentionModelosDealerService: class { listAll = vi.fn(); lookupByPlate = vi.fn(); } }));
vi.mock("./auth/backendAuthentication", () => ({
  authenticateBackendRequest: (req: { authorization?: unknown }, _res: unknown, next: () => void) => {
    req.authorization = { id: 1, dataScope: 'ALL', permissions: ['INTENTION_VIEW'] };
    next();
  },
  requirePermission: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import app from "./app";

describe("sales intentions API", () => {
  let server: Server;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => vi.clearAllMocks());

  it("expõe health check", async () => {
    await request(server).get("/health").expect(200, { status: "ok" });
  });

  it("valida intervalo incompleto antes de chamar o serviço", async () => {
    const response = await request(server).get("/sales-intentions?startDate=2026-01-01").expect(400);
    expect(response.body.message).toContain("startDate e endDate");
    expect(salesService.listAll).not.toHaveBeenCalled();
  });

  it("encaminha filtros válidos e torna o fim da data exclusivo", async () => {
    salesService.listAll.mockResolvedValue([{ id: 1 }]);
    await request(server).get("/sales-intentions?startDate=2026-01-01&endDate=2026-01-31&tipoVenda=NOVOS").expect(200, [{ id: 1 }]);
    expect(salesService.listAll).toHaveBeenCalledWith(
      expect.objectContaining({ gte: new Date(2026, 0, 1), lt: new Date(2026, 1, 1) }), "NOVOS",
      expect.objectContaining({ id: 1, dataScope: 'ALL' }),
    );
  });

  it("retorna 400 para ID inválido e 404 para registro ausente", async () => {
    await request(server).get("/sales-intentions/abc").expect(400, { message: "ID inválido." });
    salesService.getById.mockResolvedValue(null);
    await request(server).get("/sales-intentions/999").expect(404, { message: "Registro não encontrado." });
  });
});
