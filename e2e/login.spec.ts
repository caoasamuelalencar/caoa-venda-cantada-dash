import { expect, test } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("autenticação e rotas protegidas", () => {
  test("redireciona uma rota protegida para login sem aceitar destino externo", async ({ page }) => {
    await page.goto("/sales-intention?source=e2e");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsales-intention/);
    await expect(page.getByRole("heading", { name: "Conecte-se ao painel" })).toBeVisible();
  });

  test("apresenta o login Microsoft e mantém o destino interno", async ({ page }) => {
    const login = new LoginPage(page);
    await login.open("/dashboard");
    await expect(login.microsoftButton()).toBeEnabled();
    await expect(page.getByText("Acesso ao painel de vendas e relatórios.")).toBeVisible();
  });
});
