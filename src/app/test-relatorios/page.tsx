"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { useSalesIntentions } from "@/hooks/useSalesIntentions";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

export default function TestRelatoriosPage() {
  const { items: enhancedSalesIntention, isLoading: isFetching, error } = useSalesIntentions();
  const [selectedRegion, setSelectedRegion] = useState<string[]>(["Todos"]);
  const [selectedStore, setSelectedStore] = useState<string[]>(["Todos"]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>(["Todos"]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartError, setChartError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Move all hooks BEFORE conditional returns
  const regionOptions = useMemo(() => {
    const opts = Array.from(new Set(enhancedSalesIntention.map((item) => item.Regional))).filter(
      Boolean,
    );
    opts.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...opts];
  }, [enhancedSalesIntention]);

  const storeOptions = useMemo(() => {
    const opts = Array.from(new Set(enhancedSalesIntention.map((item) => item.Loja_Venda))).filter(
      Boolean,
    );
    opts.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...opts];
  }, [enhancedSalesIntention]);

  const vendorOptions = useMemo(() => {
    const opts = Array.from(new Set(enhancedSalesIntention.map((item) => item.Proprietario))).filter(
      Boolean,
    );
    opts.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    return ["Todos", ...opts];
  }, [enhancedSalesIntention]);

  if (isFetching) {
    return (
      <section className="p-8 text-center">
        <p className="text-base text-slate-600">Carregando intenções de venda...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8 text-center">
        <p className="text-base text-red-600">Erro ao carregar dados: {error}</p>
      </section>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🧪 Teste - Relatórios (Sem Autenticação)</h1>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
        <p className="text-green-800">
          ✅ <strong>Integração bem-sucedida!</strong> Dados carregados da API.
        </p>
        <p className="text-green-700 text-sm mt-2">
          Total de registros: <strong>{enhancedSalesIntention.length}</strong>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-2">Regiões ({regionOptions.length})</label>
          <select 
            multiple 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(Array.from(e.target.selectedOptions, o => o.value))}
            className="w-full border p-2 rounded"
          >
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Lojas ({storeOptions.length})</label>
          <select 
            multiple 
            value={selectedStore}
            onChange={(e) => setSelectedStore(Array.from(e.target.selectedOptions, o => o.value))}
            className="w-full border p-2 rounded"
          >
            {storeOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Vendedores ({vendorOptions.length})</label>
          <select 
            multiple 
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(Array.from(e.target.selectedOptions, o => o.value))}
            className="w-full border p-2 rounded"
          >
            {vendorOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">Primeiros 5 registros:</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-200">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Proprietário</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Regional</th>
              <th className="p-2 text-left">Marca</th>
              <th className="p-2 text-left">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {enhancedSalesIntention.slice(0, 5).map((item) => (
              <tr key={`${item.id}-${Math.random()}`} className="border-b hover:bg-slate-50">
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.Proprietario}</td>
                <td className="p-2">{item.Tipo_Venda}</td>
                <td className="p-2">{item.Regional}</td>
                <td className="p-2">{item.Marca_Veiculo}</td>
                <td className="p-2">{item.Quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link href="/test-relatorios/marca" className="text-blue-600 hover:underline mr-4">
          → Teste Marcas
        </Link>
        <Link href="/test-relatorios/vendedor" className="text-blue-600 hover:underline">
          → Teste Vendedores
        </Link>
      </div>
    </div>
  );
}
