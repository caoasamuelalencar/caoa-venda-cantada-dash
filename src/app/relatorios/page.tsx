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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
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

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

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

        let matchesDateRange = true;
        if (startDate || endDate) {
          const itemDate = parseDate(item.Data_solicitacao);
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) matchesDateRange = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) matchesDateRange = false;
          }
        }

        return matchesUf && matchesRegion && matchesStore && matchesVendor && matchesDateRange;
      }),
    [selectedUf, selectedRegion, selectedStore, selectedVendor, startDate, endDate],
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
      <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Relatórios</p>
          <h2 className="text-lg font-semibold">Visão geral das intenções de venda</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/relatorios/marca"
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
          >
            Relatório por Marca
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-2 shadow-sm">
        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Filtros</p>
            <h2 className="text-base font-semibold">Propostas por UF, Região, Loja e Vendedor</h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Total: <span className="font-semibold">{totalProposals}</span>
          </div>
        </div>

        <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-6">
          <label className="space-y-0.5">
            <span className="text-xs font-medium">UF</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <label className="space-y-0.5">
            <span className="text-xs font-medium">Região</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <label className="space-y-0.5">
            <span className="text-xs font-medium">Loja</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <label className="space-y-0.5">
            <span className="text-xs font-medium">Vendedor</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <label className="space-y-0.5">
            <span className="text-xs font-medium">De</span>
            <input
              type="date"
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="space-y-0.5">
            <span className="text-xs font-medium">Até</span>
            <input
              type="date"
              className="w-full rounded-lg border border-border bg-background px-1.5 py-0.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Gráfico de Propostas</h2>
            <p className="text-xs text-muted-foreground">
              Distribuição por loja ({chartData.length} lojas)
            </p>
          </div>
        </div>

        <div className="h-[400px]">
          {chartError && (
            <div className="mb-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
              Erro: {chartError}
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
