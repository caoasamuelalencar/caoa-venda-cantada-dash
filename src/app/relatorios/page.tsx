"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec, ILineChartSpec, IPieChartSpec } from "@visactor/vchart";
import {
  ArrowUpRight,
  Activity,
  CalendarClock,
  Clock3,
  MapPin,
  RefreshCw,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSalesIntentions } from "@/hooks/useSalesIntentions";

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

function parseReportDateTime(value: string) {
  const [datePart, timePart = "00:00"] = value.trim().split(/\s+/);
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(":").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateInputValue(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMultiSelectValue(selectedOptions: HTMLCollectionOf<HTMLOptionElement>) {
  const values = Array.from(selectedOptions).map((option) => option.value);
  return values.includes("Todos") || values.length === 0 ? ["Todos"] : values;
}

function getTopItems<T>(items: T[], limit: number) {
  return items.slice(0, limit);
}

export default function RelatoriosPage() {
  const { items: sales, isLoading, isRefreshing, error, refresh } = useSalesIntentions();
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Todos"]);
  const [selectedStores, setSelectedStores] = useState<string[]>(["Todos"]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(["Todos"]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartError, setChartError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>("Criado");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegions, selectedStores, selectedVendors, startDate, endDate]);

  const regionOptions = useMemo(() => {
    const values = Array.from(new Set(sales.map((item) => item.Regional))).filter(Boolean);
    values.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...values];
  }, [sales]);

  const storeOptions = useMemo(() => {
    const values = Array.from(new Set(sales.map((item) => item.Loja_Venda))).filter(Boolean);
    values.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...values];
  }, [sales]);

  const vendorOptions = useMemo(() => {
    const values = Array.from(new Set(sales.map((item) => item.Proprietario))).filter(Boolean);
    values.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...values];
  }, [sales]);

  const filteredItems = useMemo(() => {
    return sales.filter((item) => {
      const matchesRegion =
        selectedRegions.includes("Todos") || selectedRegions.includes(item.Regional);
      const matchesStore =
        selectedStores.includes("Todos") || selectedStores.includes(item.Loja_Venda);
      const matchesVendor =
        selectedVendors.includes("Todos") || selectedVendors.includes(item.Proprietario);

      let matchesDateRange = true;
      if (startDate || endDate) {
        const itemDate = parseReportDateTime(item.Data_solicitacao);
        if (!itemDate) return false;

        if (startDate) {
          const start = parseDateInputValue(startDate);
          if (start) {
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) matchesDateRange = false;
          }
        }

        if (endDate) {
          const end = parseDateInputValue(endDate);
          if (end) {
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) matchesDateRange = false;
          }
        }
      }

      return matchesRegion && matchesStore && matchesVendor && matchesDateRange;
    });
  }, [sales, selectedRegions, selectedStores, selectedVendors, startDate, endDate]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];

    if (!sortKey) {
      return items.sort((a, b) => {
        const left = parseReportDateTime(a.Criado)?.getTime() ?? 0;
        const right = parseReportDateTime(b.Criado)?.getTime() ?? 0;
        return right - left;
      });
    }

    const compareValue = (value: unknown) => {
      const raw = String(value ?? "");
      const numeric = Number(raw.replace(/[.,]/g, ""));
      if (!Number.isNaN(numeric) && raw.trim() !== "") {
        return numeric;
      }
      return normalizeLabel(raw);
    };

    items.sort((a, b) => {
      const aVal = compareValue((a as Record<string, unknown>)[sortKey]);
      const bVal = compareValue((b as Record<string, unknown>)[sortKey]);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal), "pt-BR", { sensitivity: "base" })
        : String(bVal).localeCompare(String(aVal), "pt-BR", { sensitivity: "base" });
    });

    return items;
  }, [filteredItems, sortKey, sortDir]);

  const totalIntentions = filteredItems.length;
  const totalQuantity = filteredItems.reduce(
    (sum, item) => sum + (Number(item.Quantidade) || 0),
    0,
  );
  const activeRegions = new Set(filteredItems.map((item) => item.Regional).filter(Boolean)).size;
  const activeStores = new Set(filteredItems.map((item) => item.Loja_Venda).filter(Boolean)).size;
  const activeVendors = new Set(
    filteredItems.map((item) => item.Proprietario).filter(Boolean),
  ).size;
  const averageQuantityPerIntention =
    totalIntentions > 0 ? (totalQuantity / totalIntentions).toFixed(2) : "0.00";

  const parsedItems = useMemo(
    () =>
      filteredItems
        .map((item) => ({
          ...item,
          createdAt: parseReportDateTime(item.Criado),
        }))
        .filter((item) => item.createdAt !== null)
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
    [filteredItems],
  );

  const referenceDate = parsedItems[0]?.createdAt ?? new Date();
  const liveWindowStart = new Date(referenceDate.getTime() - 60 * 60 * 1000);

  const liveWindowItems = parsedItems.filter(
    (item) => (item.createdAt?.getTime() ?? 0) >= liveWindowStart.getTime(),
  );

  const liveTrendData = useMemo(() => {
    const grouped = new Map<string, { label: string; quantity: number }>();

    liveWindowItems.forEach((item) => {
      const createdAt = item.createdAt;
      if (!createdAt) return;
      const label = format(createdAt, "HH:mm");
      const current = grouped.get(label);
      const quantity = Number(item.Quantidade) || 0;

      if (current) {
        current.quantity += quantity;
      } else {
        grouped.set(label, { label, quantity });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [liveWindowItems]);

  const topActivityMinute = useMemo(() => {
    return liveTrendData.reduce(
      (best, item) => (item.quantity > best.quantity ? item : best),
      { label: "--:--", quantity: 0 },
    );
  }, [liveTrendData]);

  const totalLiveWindow = liveWindowItems.reduce(
    (sum, item) => sum + (Number(item.Quantidade) || 0),
    0,
  );

  const liveVelocity = liveTrendData.length > 0 ? (totalLiveWindow / liveTrendData.length).toFixed(1) : "0.0";

  const typeMixData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredItems.forEach((item) => {
      const key = item.Tipo_Venda || "Sem tipo";
      grouped.set(key, (grouped.get(key) || 0) + (Number(item.Quantidade) || 0));
    });

    return Array.from(grouped.entries())
      .map(([type, quantity]) => ({ type, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredItems]);

  const regionalData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredItems.forEach((item) => {
      const key = item.Regional || "Sem regional";
      grouped.set(key, (grouped.get(key) || 0) + (Number(item.Quantidade) || 0));
    });

    return Array.from(grouped.entries())
      .map(([regional, quantity]) => ({ regional, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredItems]);

  const storeData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredItems.forEach((item) => {
      const key = item.Loja_Venda || "Sem loja";
      grouped.set(key, (grouped.get(key) || 0) + (Number(item.Quantidade) || 0));
    });

    return Array.from(grouped.entries())
      .map(([store, quantity]) => ({ store, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredItems]);

  const classificationData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredItems.forEach((item) => {
      const key = item.Classificacao || "Sem classificação";
      grouped.set(key, (grouped.get(key) || 0) + (Number(item.Quantidade) || 0));
    });

    return Array.from(grouped.entries())
      .map(([classification, quantity]) => ({ classification, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredItems]);

  const recentItems = useMemo(
    () => getTopItems(parsedItems, 8),
    [parsedItems],
  );

  const liveTrendSpec = useMemo<ILineChartSpec>(
    () => ({
      type: "line",
      data: [
        {
          id: "liveTrend",
          values: liveTrendData,
        },
      ],
      xField: "label",
      yField: "quantity",
      smooth: true,
      point: {
        style: {
          size: 6,
        },
      },
      line: {
        style: {
          lineWidth: 3,
        },
      },
      area: {
        style: {
          fillOpacity: 0.18,
        },
      },
      padding: [20, 20, 20, 20],
      axis: {
        xAxis: {
          label: {
            rotate: 0,
            maxWidth: 80,
          },
        },
        yAxis: {
          label: {
            formatter: (value: string | number) => String(value),
          },
        },
      },
      tooltip: {
        trigger: ["hover", "click"],
      },
    }),
    [liveTrendData],
  );

  const regionalSpec = useMemo<IBarChartSpec>(
    () => ({
      type: "bar",
      data: [
        {
          id: "regional",
          values: regionalData,
        },
      ],
      direction: "vertical",
      xField: "regional",
      yField: "quantity",
      stack: false,
      padding: [20, 20, 20, 20],
      axis: {
        xAxis: {
          label: {
            rotate: 0,
            maxWidth: 90,
          },
        },
        yAxis: {
          label: {
            formatter: (value: string | number) => String(value),
          },
        },
      },
      tooltip: {
        trigger: ["hover", "click"],
      },
      bar: {
        style: {
          cornerRadius: [10, 10, 0, 0],
        },
      },
    }),
    [regionalData],
  );

  const storeSpec = useMemo<IBarChartSpec>(
    () => ({
      type: "bar",
      data: [
        {
          id: "stores",
          values: storeData.slice(0, 8),
        },
      ],
      direction: "vertical",
      xField: "store",
      yField: "quantity",
      stack: false,
      padding: [20, 20, 20, 20],
      axis: {
        xAxis: {
          label: {
            rotate: 35,
            textAlign: "right",
            textBaseline: "middle",
            maxWidth: 120,
            overflow: "ellipsis",
          },
        },
        yAxis: {
          label: {
            formatter: (value: string | number) => String(value),
          },
        },
      },
      tooltip: {
        trigger: ["hover", "click"],
      },
      bar: {
        style: {
          cornerRadius: [10, 10, 0, 0],
        },
      },
    }),
    [storeData],
  );

  const typeMixSpec = useMemo<IPieChartSpec>(
    () => ({
      type: "pie",
      data: [
        {
          id: "typeMix",
          values: typeMixData,
        },
      ],
      categoryField: "type",
      valueField: "quantity",
      padding: [12, 12, 12, 12],
      tooltip: {
        trigger: ["hover", "click"],
      },
      series: [
        {
          type: "pie",
          categoryField: "type",
          valueField: "quantity",
          outerRadius: 0.88,
          innerRadius: 0.58,
          pie: {
            style: {
              stroke: "#ffffff",
              lineWidth: 2,
            },
          },
          label: {
            visible: true,
            position: "outside",
            style: {
              fontSize: 12,
              fontWeight: 600,
            },
          },
        },
      ],
    }),
    [typeMixData],
  );

  const classificationSpec = useMemo<IPieChartSpec>(
    () => ({
      type: "pie",
      data: [
        {
          id: "classificationMix",
          values: classificationData,
        },
      ],
      categoryField: "classification",
      valueField: "quantity",
      padding: [12, 12, 12, 12],
      tooltip: {
        trigger: ["hover", "click"],
      },
      series: [
        {
          type: "pie",
          categoryField: "classification",
          valueField: "quantity",
          outerRadius: 0.88,
          innerRadius: 0.58,
          pie: {
            style: {
              stroke: "#ffffff",
              lineWidth: 2,
            },
          },
          label: {
            visible: true,
            position: "outside",
            style: {
              fontSize: 12,
              fontWeight: 600,
            },
          },
        },
      ],
    }),
    [classificationData],
  );

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const currentPageItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems, itemsPerPage]);

  const exportToExcel = () => {
    const allKeys = new Set<string>();
    filteredItems.forEach((row) => Object.keys(row || {}).forEach((key) => allKeys.add(key)));

    const firstRow = filteredItems[0] || {};
    const firstKeys = Object.keys(firstRow);
    const remainingKeys = Array.from(allKeys)
      .filter((key) => !firstKeys.includes(key))
      .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    const headers = [...firstKeys, ...remainingKeys];

    const rows = filteredItems.map((item) =>
      headers.map((header) => String((item as Record<string, unknown>)[header] ?? "")),
    );

    const table = [headers, ...rows]
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table>${table}</table></body></html>`;
    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorios-${format(new Date(), "yyyyMMdd_HHmmss")}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading && sales.length === 0) {
    return (
      <section className="rounded-[28px] border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-base text-muted-foreground">Carregando dashboard de relatórios...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
        <p className="text-base font-medium">Erro ao carregar dados</p>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    );
  }

  const metrics = [
    {
      label: "Intenções filtradas",
      value: totalIntentions.toLocaleString("pt-BR"),
      helper: "registros visíveis no período",
      icon: Activity,
    },
    {
      label: "Quantidade total",
      value: totalQuantity.toLocaleString("pt-BR"),
      helper: "soma de todas as intenções",
      icon: TrendingUp,
    },
    {
      label: "Velocidade média",
      value: `${liveVelocity}/min`,
      helper: "janela móvel dos últimos 60 min",
      icon: Clock3,
    },
    {
      label: "Pico por minuto",
      value: `${topActivityMinute.quantity.toLocaleString("pt-BR")}/min`,
      helper: topActivityMinute.label === "--:--" ? "sem dados recentes" : `às ${topActivityMinute.label}`,
      icon: CalendarClock,
    },
    {
      label: "Regiões ativas",
      value: activeRegions.toLocaleString("pt-BR"),
      helper: "regiões com movimentos",
      icon: MapPin,
    },
    {
      label: "Lojas ativas",
      value: activeStores.toLocaleString("pt-BR"),
      helper: "pontos com registros",
      icon: Store,
    },
    {
      label: "Vendedores ativos",
      value: activeVendors.toLocaleString("pt-BR"),
      helper: "usuários com movimentação",
      icon: Users,
    },
  ];

  return (
    <section className="relative space-y-6 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] px-4 py-6 text-slate-900 sm:px-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)]" />
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] dark:ring-white/5">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.6fr_1fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-white/90">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Dashboard ao vivo
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualização automática a cada 15s
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300/90">Relatórios</p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Painel executivo das intenções de venda em tempo real
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                Acompanhe o volume de intenções, regiões mais ativas, mix de vendas e
                concentração por loja em uma interface pensada para picos de operação.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void refresh({ silent: true })}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar agora
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-4 py-2"
              >
                <Link href="/relatorios/marca" className="inline-flex items-center gap-2">
                  Relatório por marca
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-4 py-2"
              >
                <Link href="/relatorios/vendedor" className="inline-flex items-center gap-2">
                  Relatório por vendedor
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Última atualização</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">
                    {format(new Date(), "HH:mm:ss")}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    painel pronto para absorver novos eventos
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Janela viva</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">
                    {totalLiveWindow.toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    intenções no recorte dos últimos 60 minutos
                  </p>
                </div>
                <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_22px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)] dark:ring-white/5 dark:hover:shadow-[0_22px_70px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{metric.helper}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-3 text-slate-950 shadow-lg shadow-cyan-950/30">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Filtros</p>
            <h2 className="text-xl font-semibold">Refinar visão do dashboard</h2>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {currentPageItems.length} de {sortedItems.length} registros filtrados
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-6">
          <label className="space-y-1 lg:col-span-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Região</span>
            <select
              multiple
              size={4}
              className="w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100"
              value={selectedRegions}
              onChange={(event) => setSelectedRegions(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Loja</span>
            <select
              multiple
              size={4}
              className="w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100"
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

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Vendedor</span>
            <select
              multiple
              size={4}
              className="w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100"
              value={selectedVendors}
              onChange={(event) => setSelectedVendors(parseMultiSelectValue(event.target.selectedOptions))}
            >
              {vendorOptions.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">De</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Até</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedRegions(["Todos"]);
              setSelectedStores(["Todos"]);
              setSelectedVendors(["Todos"]);
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-full"
          >
            Limpar filtros
          </Button>
          <Button type="button" onClick={exportToExcel} className="rounded-full">
            Exportar planilha
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-2 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Fluxo em tempo real
              </p>
              <h2 className="text-xl font-semibold">Volume por minuto na última hora</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Janela móvel com base no registro mais recente carregado
            </p>
          </div>

          <div className="h-[360px]">
            {chartError ? (
              <div className="mb-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                Erro no gráfico: {chartError}
              </div>
            ) : null}
            <VChart
              spec={liveTrendSpec}
              onError={(err) => {
                setChartError(err ? String(err) : "Erro desconhecido");
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Mix operacional</p>
            <h2 className="text-xl font-semibold">Participação por tipo de venda</h2>
          </div>
          <div className="h-[340px]">
            <VChart
              spec={typeMixSpec}
              onError={(err) => {
                setChartError(err ? String(err) : "Erro desconhecido");
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Mapa de força</p>
            <h2 className="text-xl font-semibold">Regiões com maior volume</h2>
          </div>
          <div className="h-[340px]">
            <VChart
              spec={regionalSpec}
              onError={(err) => {
                setChartError(err ? String(err) : "Erro desconhecido");
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-2 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Concentração</p>
            <h2 className="text-xl font-semibold">Top lojas por quantidade vendida</h2>
          </div>
          <div className="h-[360px]">
            <VChart
              spec={storeSpec}
              onError={(err) => {
                setChartError(err ? String(err) : "Erro desconhecido");
              }}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-2 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Qualidade do mix</p>
            <h2 className="text-xl font-semibold">Distribuição por classificação</h2>
          </div>
          <div className="h-[320px]">
            <VChart
              spec={classificationSpec}
              onError={(err) => {
                setChartError(err ? String(err) : "Erro desconhecido");
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Linha do tempo</p>
              <h2 className="text-xl font-semibold">Últimas intenções recebidas</h2>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Última carga: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <th className="px-3 py-3">Horário</th>
                  <th className="px-3 py-3">Vendedor</th>
                  <th className="px-3 py-3">Regional</th>
                  <th className="px-3 py-3">Loja</th>
                  <th className="px-3 py-3 text-right">Qtd</th>
                  <th className="px-3 py-3">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {recentItems.map((item) => (
                  <tr key={`${item.ID}-${item.Criado}`} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900 dark:text-white">
                      {item.createdAt ? format(item.createdAt, "dd/MM HH:mm") : item.Criado}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.Proprietario}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600 dark:text-slate-300">{item.Regional}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.Loja_Venda}</td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {Number(item.Quantidade).toLocaleString("pt-BR")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600 dark:text-slate-300">{item.Tipo_Venda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Operação viva</p>
                <h2 className="text-xl font-semibold">Indicadores do minuto</h2>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300 ring-1 ring-cyan-400/20">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-400">Volume na última hora</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{totalLiveWindow.toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-400">Pico observado</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                  {topActivityMinute.quantity.toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {topActivityMinute.label === "--:--"
                    ? "sem janela recente"
                    : `às ${topActivityMinute.label}`}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-400">Média por intenção</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{averageQuantityPerIntention}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Atalhos</p>
                <h2 className="text-xl font-semibold">Navegação do painel</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-white dark:ring-white/5">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href="/relatorios/marca"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10"
              >
                <span>Relatório por marca</span>
                <ArrowUpRight className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              </Link>
              <Link
                href="/relatorios/vendedor"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10"
              >
                <span>Relatório por vendedor</span>
                <ArrowUpRight className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:ring-white/5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Tabela analítica</p>
            <h2 className="text-xl font-semibold">Registros filtrados com ordenação dinâmica</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2">
              Itens por página
              <select
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                value={itemsPerPage}
                onChange={(event) => setItemsPerPage(Number(event.target.value))}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
                {Object.keys(filteredItems[0] || {}).map((key) => (
                  <th key={key} className="px-3 py-3 text-left font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortKey === key) {
                          setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
                        } else {
                          setSortKey(key);
                          setSortDir("asc");
                        }
                      }}
                      className="inline-flex w-full items-center justify-between gap-2 text-left transition hover:text-cyan-600 dark:hover:text-cyan-300"
                    >
                      <span>{key}</span>
                      <span>{sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {currentPageItems.map((item, rowIndex) => (
                <tr key={`${item.ID}-${rowIndex}`} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  {Object.keys(filteredItems[0] || {}).map((key) => (
                    <td key={`${item.ID}-${key}`} className="whitespace-nowrap px-3 py-3 text-slate-600 dark:text-slate-300">
                      {String((item as Record<string, unknown>)[key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            {sortedItems.length === 0
              ? "Nenhum registro encontrado com os filtros atuais."
              : `Mostrando ${currentPageItems.length} de ${sortedItems.length} registros.`}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              Primeira
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            >
              Próxima
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Última
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
