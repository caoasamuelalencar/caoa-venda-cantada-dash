import { expect, type Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(callbackUrl = "/sales-intention") {
    await this.page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    await expect(this.page.getByRole("heading", { name: "Conecte-se ao painel" })).toBeVisible();
  }

  microsoftButton() {
    return this.page.getByRole("button", { name: "Entrar com Microsoft" });
  }
}
