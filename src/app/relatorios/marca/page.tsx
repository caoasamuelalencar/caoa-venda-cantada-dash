"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { salesIntention } from "@/data/sales-intention";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

const deduceUfFromStore = (storeName: string) => {
  const normalizedStore = normalizeLabel(storeName.replace(/^D\d+-\d+-/, "").trim());

  const storeToUf = new Map<string, string>([
    ["JOAO PESSOA", "PB"],
    ["PARALELA", "BA"],
    ["MOREIRA GUIMARAES", "BA"],
    ["BARRA", "BA"],
    ["MAGALHAES NETO", "BA"],
    ["CEASA SHOWROOM", "SP"],
    ["BOTAFOGO", "RJ"],
    ["RIBEIRAO PRETO", "SP"],
    ["JUNDIAI", "SP"],
    ["BAURU", "SP"],
    ["SAO BERNARDO", "SP"],
    ["SAO CAETANO", "SP"],
    ["MORUMBI", "SP"],
    ["BRAZ CUBAS", "SP"],
    ["CAXIAS DO SUL", "RS"],
    ["CANOAS", "RS"],
    ["POA", "RS"],
    ["CEARA", "CE"],
    ["POA-CEARA", "CE"],
    ["IMBIRIBEIRA", "PE"],
    ["ANAPOLIS", "GO"],
    ["MUTIRAO", "DF"],
    ["EPIA", "DF"],
    ["S.I.A", "DF"],
  ]);

  if (storeToUf.has(normalizedStore)) {
    return storeToUf.get(normalizedStore) as string;
  }

  for (const [knownStore, uf] of storeToUf) {
    if (normalizedStore.includes(knownStore)) {
      return uf;
    }
  }

  return "N/D";
};

const enhancedSalesIntention = salesIntention.map((item) => ({
  ...item,
  uf: deduceUfFromStore(item.Loja_Venda),
}));

export default function MarcaVeiculoRelatorioPage() {
  const [selectedUfs, setSelectedUfs] = useState<string[]>(["Todos"]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Todos"]);
  const [selectedStores, setSelectedStores] = useState<string[]>(["Todos"]);
  const [selectedSalesTypes, setSelectedSalesTypes] = useState<string[]>(["Todos"]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>(["Todos"]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [chartError, setChartError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const lastUpdatedText = lastUpdated ? format(lastUpdated, "dd/MM/yyyy HH:mm:ss") : "Carregando...";

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const ufOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(enhancedSalesIntention.map((item) => item.uf)).values(),
      ).filter((uf) => uf !== "N/D"),
    ],
    [],
  );

  const regionOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(enhancedSalesIntention.map((item) => item.Regional))),
    ],
    [],
  );

  const storeOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(enhancedSalesIntention.map((item) => item.Loja_Venda))),
    ],
    [],
  );

  const salesTypeOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(enhancedSalesIntention.map((item) => item.Tipo_Venda))).filter(
        Boolean,
      ),
    ],
    [],
  );

  const classificationOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(enhancedSalesIntention.map((item) => item.Classificacao))).filter(
        Boolean,
      ),
    ],
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [
    selectedUfs,
    selectedRegions,
    selectedStores,
    selectedSalesTypes,
    selectedClassifications,
    refreshTick,
  ]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsLoading(true);
      setRefreshTick((tick) => tick + 1);
      setLastUpdated(new Date());
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const parseMultiSelectValue = (
    selectedOptions: HTMLCollectionOf<HTMLOptionElement>,
  ) => {
    const values = Array.from(selectedOptions).map((option) => option.value);
    return values.includes("Todos") || values.length === 0 ? ["Todos"] : values;
  };

  const filteredItems = useMemo(
    () =>
      enhancedSalesIntention.filter((item) => {
        const matchesUf =
          selectedUfs.includes("Todos") || selectedUfs.includes(item.uf);
        const matchesRegion =
          selectedRegions.includes("Todos") || selectedRegions.includes(item.Regional);
        const matchesStore =
          selectedStores.includes("Todos") || selectedStores.includes(item.Loja_Venda);
        const matchesSalesType =
          selectedSalesTypes.includes("Todos") || selectedSalesTypes.includes(item.Tipo_Venda);
        const matchesClassification =
          selectedClassifications.includes("Todos") ||
          selectedClassifications.includes(item.Classificacao);

        return (
          matchesUf &&
          matchesRegion &&
          matchesStore &&
          matchesSalesType &&
          matchesClassification
        );
      }),
    [
      selectedUfs,
      selectedRegions,
      selectedStores,
      selectedSalesTypes,
      selectedClassifications,
    ],
  );

  const totalProposals = filteredItems.reduce(
    (sum, item) => sum + (Number(item.Quantidade) || 0),
    0,
  );

  const totalApproved = filteredItems.reduce((sum, item) => {
    const quantity = Number(item.Quantidade) || 0;
    const classification = item.Classificacao?.toString().toLowerCase() || "";
    const isRejected =
      classification.includes("reprov") ||
      classification.includes("cancel") ||
      classification.includes("negado");
    return sum + (isRejected ? 0 : quantity);
  }, 0);

  const totalRejected = totalProposals - totalApproved;

  const brandData = useMemo(() => {
    const grouped = new Map<string, { marca: string; count: number }>();

    filteredItems.forEach((item) => {
      const marca = item.Marca_Veiculo || "Sem Marca";
      const quantity = Number(item.Quantidade) || 0;
      const previous = grouped.get(marca);

      if (previous) {
        grouped.set(marca, {
          ...previous,
          count: previous.count + quantity,
        });
      } else {
        grouped.set(marca, {
          marca,
          count: quantity,
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [filteredItems]);

  const brandChartData = useMemo(() => {
    const top5 = brandData.slice(0, 5);
    const others = brandData.slice(5);
    const otherCount = others.reduce((sum, item) => sum + item.count, 0);
    return otherCount > 0 ? [...top5, { marca: "Outros", count: otherCount }] : top5;
  }, [brandData]);

  const brandChartSpec = useMemo<IBarChartSpec>(() => ({
    type: "bar",
    data: [
      {
        id: "marcaPropostas",
        values: brandChartData,
      },
    ],
    direction: "horizontal",
    xField: "count",
    yField: "marca",
    stack: false,
    padding: [20, 20, 20, 0],
    tooltip: {
      trigger: ["hover", "click"],
    },
    bar: {
      style: {
        cornerRadius: [8, 8, 8, 8],
      },
    },
  }), [brandChartData]);

  const brandChartKey = useMemo(() => JSON.stringify(brandChartSpec), [brandChartSpec]);

  const exportToExcel = () => {
    const headers = [
      "ID",
      "Marca_Veiculo",
      "UF",
      "Regional",
      "Loja_Venda",
      "Quantidade",
      "Data_solicitacao",
      "Classificacao",
      "Criado",
    ];

    const rows = filteredItems.map((item) => [
      item.ID,
      item.Marca_Veiculo,
      item.uf,
      item.Regional,
      item.Loja_Venda,
      item.Quantidade,
      item.Data_solicitacao,
      item.Classificacao,
      item.Criado,
    ]);

    const table = [headers, ...rows]
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${String(cell ?? "")}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table>${table}</table></body></html>`;
    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-marca-${format(new Date(), "yyyyMMdd_HHmmss")}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative space-y-6 py-6 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-slate-950/30 p-6">
          <div className="rounded-3xl border border-border bg-card px-6 py-4 text-center shadow-lg">
            <p className="text-base font-semibold">Carregando dados...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Aguarde um instante enquanto atualizamos as informações.
            </p>
          </div>
        </div>
      )}

      <div className="min-w-0 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Nova rota de relatórios</p>
          <h1 className="text-2xl font-semibold">Visão global por Marca de Veículo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Última atualização: {lastUpdatedText}
          </p>
        </div>
        <Link
          href="/relatorios"
          className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          Voltar para Relatórios gerais
        </Link>
      </div>

      <div className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Total de propostas</p>
            <p className="mt-2 text-3xl font-semibold">{totalProposals}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Propostas aprovadas</p>
            <p className="mt-2 text-3xl font-semibold">{totalApproved}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Propostas reprovadas</p>
            <p className="mt-2 text-3xl font-semibold">{totalRejected}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Lojas filtradas</p>
            <p className="mt-2 text-3xl font-semibold">{new Set(filteredItems.map((item) => item.Loja_Venda)).size}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <label className="min-w-0 space-y-2">
            <span className="text-sm font-medium">UF</span>
            <select
              multiple
              size={6}
              className="w-full min-h-[170px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedUfs}
              onChange={(event) => setSelectedUfs(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {ufOptions.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 space-y-2">
            <span className="text-sm font-medium">Região</span>
            <select
              multiple
              size={6}
              className="w-full min-h-[170px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedRegions}
              onChange={(event) => setSelectedRegions(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region || "Sem regional"}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 space-y-2">
            <span className="text-sm font-medium">Loja</span>
            <select
              multiple
              size={6}
              className="w-full min-h-[170px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedStores}
              onChange={(event) => setSelectedStores(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {storeOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 space-y-2">
            <span className="text-sm font-medium">Tipo de Venda</span>
            <select
              multiple
              size={6}
              className="w-full min-h-[170px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedSalesTypes}
              onChange={(event) => setSelectedSalesTypes(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {salesTypeOptions.map((salesType) => (
                <option key={salesType} value={salesType}>
                  {salesType}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 space-y-2">
            <span className="text-sm font-medium">Classificação</span>
            <select
              multiple
              size={6}
              className="w-full min-h-[170px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedClassifications}
              onChange={(event) => setSelectedClassifications(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {classificationOptions.map((classification) => (
                <option key={classification} value={classification}>
                  {classification}
                </option>
              ))}
            </select>
          </label>

        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Propostas por Marca de Veículo</h2>
            <p className="text-sm text-muted-foreground">
              As marcas mais relevantes no período filtrado.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="default" onClick={exportToExcel}>
              Exportar dados para Excel
            </Button>
            <span className="text-sm text-muted-foreground">
              Exibindo {brandChartData.length} marcas no gráfico
            </span>
          </div>
        </div>

        <div className="h-[520px] min-h-[420px] w-full overflow-hidden">
          {chartError && (
            <div className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-700">
              Erro no gráfico: {chartError}
            </div>
          )}
          <VChart
            key={brandChartKey}
            spec={brandChartSpec}
            onError={(err) => {
              // log and display the error so we can diagnose runtime failures
              // eslint-disable-next-line no-console
              console.error("VChart error:", err);
              setChartError(err ? String(err) : "Erro desconhecido");
            }}
          />
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Como utilizar este relatório</h2>
          <p className="text-sm text-muted-foreground">
            Use os filtros à esquerda e selecione múltiplas UFs, regiões e lojas para cruzar os dados.
          </p>
        </div>
        <ul className="space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
          <li>1. Selecione várias opções de UF, Região e Loja usando Ctrl/Cmd.</li>
          <li>2. Use os filtros para refinar os dados exibidos.</li>
          <li>3. Use os filtros de Tipo de Venda e Classificação para cruzar segmentos de dados.</li>
          <li>4. O gráfico mostra as 5 marcas mais relevantes e soma o restante como &quot;Outros&quot;.</li>
          <li>5. Exporte os dados filtrados para Excel e abra em qualquer planilha.</li>
          <li>6. Os dados são atualizados automaticamente a cada minuto e um indicador de carregamento aparece durante a atualização.</li>
        </ul>
      </div>
    </section>
  );
}
