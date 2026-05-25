"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { salesIntention } from "@/data/sales-intention";

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

export default function RelatoriosPage() {
  const [selectedUf, setSelectedUf] = useState("Todos");
  const [selectedRegion, setSelectedRegion] = useState("Todos");
  const [selectedStore, setSelectedStore] = useState("Todos");
  const [selectedVendor, setSelectedVendor] = useState("Todos");
  const [chartError, setChartError] = useState<string | null>(null);

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

  const vendorOptions = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(enhancedSalesIntention.map((item) => item.Proprietario))),
    ],
    [],
  );

  const filteredItems = useMemo(
    () =>
      enhancedSalesIntention.filter((item) => {
        const matchesUf = selectedUf === "Todos" || item.uf === selectedUf;
        const matchesRegion =
          selectedRegion === "Todos" || item.Regional === selectedRegion;
        const matchesStore =
          selectedStore === "Todos" || item.Loja_Venda === selectedStore;
        const matchesVendor =
          selectedVendor === "Todos" || item.Proprietario === selectedVendor;

        return matchesUf && matchesRegion && matchesStore && matchesVendor;
      }),
    [selectedUf, selectedRegion, selectedStore, selectedVendor],
  );

  const chartData = useMemo(() => {
    const grouped = new Map<string, { loja: string; regional: string; uf: string; count: number }>();

    filteredItems.forEach((item) => {
      const key = `${item.uf}||${item.Regional}||${item.Loja_Venda}`;
      const quantity = Number(item.Quantidade) || 0;
      const previous = grouped.get(key);

      if (previous) {
        grouped.set(key, {
          ...previous,
          count: previous.count + quantity,
        });
      } else {
        grouped.set(key, {
          loja: item.Loja_Venda,
          regional: item.Regional || "Sem regional",
          uf: item.uf,
          count: quantity,
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [filteredItems]);

  const totalProposals = filteredItems.reduce(
    (sum, item) => sum + (Number(item.Quantidade) || 0),
    0,
  );

  const chartSpec = useMemo<IBarChartSpec>(() => ({
    type: "bar",
    data: [
      {
        id: "propostas",
        values: chartData,
      },
    ],
    direction: "horizontal",
    xField: "count",
    yField: "loja",
    seriesField: "regional",
    stack: false,
    padding: [20, 20, 20, 20],
    tooltip: {
      trigger: ["hover", "click"],
    },
    legends: {
      visible: true,
    },
    bar: {
      style: {
        cornerRadius: [8, 8, 8, 8],
      },
    },
  }), [chartData]);

  const chartKey = useMemo(() => JSON.stringify(chartSpec), [chartSpec]);

  return (
    <section className="space-y-6 py-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Relatórios</p>
          <h2 className="text-2xl font-semibold">Visão geral das intenções de venda</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/relatorios/marca"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Relatório por Marca de Veículo
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Filtros aplicados</p>
            <h2 className="text-xl font-semibold">Propostas por UF, Região, Loja e Vendedor</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Total de propostas: <span className="font-semibold">{totalProposals}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">UF</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedUf}
              onChange={(event) => setSelectedUf(event.target.value)}
            >
              {ufOptions.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Região</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region || "Sem regional"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Loja</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedStore}
              onChange={(event) => setSelectedStore(event.target.value)}
            >
              {storeOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Vendedor</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={selectedVendor}
              onChange={(event) => setSelectedVendor(event.target.value)}
            >
              {vendorOptions.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Gráfico de Propostas</h2>
            <p className="text-sm text-muted-foreground">
              Distribuição de propostas por loja filtrada por UF, região e vendedor.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {chartData.length} lojas com propostas
          </div>
        </div>

        <div className="h-[520px]">
          {chartError && (
            <div className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-700">
              Erro no gráfico: {chartError}
            </div>
          )}
          <VChart
            key={chartKey}
            spec={chartSpec}
            onError={(err) => {
              // log and display the error so we can diagnose runtime failures
              // err may be a string or an Error-like object
              // eslint-disable-next-line no-console
              console.error("VChart error:", err);
              setChartError(err ? String(err) : "Erro desconhecido");
            }}
          />
        </div>
      </div>
    </section>
  );
}
