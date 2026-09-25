import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterSelectCard } from "./sales-intention-filter-select-card";

describe("FilterSelectCard", () => {
  it("permite selecionar e limpar filtros pelo fluxo acessível", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterSelectCard label="Bandeira" value={[]} options={["CAOA CHERY", "HYUNDAI"]} onChange={onChange} tooltip="Filtre por marca" />);

    await user.click(screen.getByRole("button", { name: "Bandeira: Todos" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "CAOA CHERY" }));
    expect(onChange).toHaveBeenCalledWith(["CAOA CHERY"]);

    await user.click(screen.getByRole("menuitemcheckbox", { name: "Todos" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
