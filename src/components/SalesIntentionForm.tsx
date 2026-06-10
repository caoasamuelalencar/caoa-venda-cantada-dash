'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { SalesIntentionPayload } from '@/types/types';

const initialValues: SalesIntentionPayload = {
  proprietario: '',
  tipoVenda: '',
  bandeira: '',
  lojaVenda: '',
  marcaVeiculo: '',
  versao: '',
  classificacao: '',
  quantidade: 1,
  dataSolicitacao: '',
  placa: '',
  regional: ''
};

export default function SalesIntentionForm() {
  const [formData, setFormData] = useState(initialValues);
  const [message, setMessage] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === 'quantidade' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/sales-intentions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.message ?? 'Falha ao enviar os dados.');
      }

      setMessage('Intenção de venda registrada com sucesso.');
      setFormData(initialValues);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro desconhecido.');
    }
  };

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Registrar intenção de venda</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            Proprietário
            <input
              name="proprietario"
              value={formData.proprietario}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            Tipo de venda
            <input
              name="tipoVenda"
              value={formData.tipoVenda}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            Bandeira
            <input name="bandeira" value={formData.bandeira} onChange={handleChange} className="input" required />
          </label>
          <label className="flex flex-col gap-2">
            Loja venda
            <input name="lojaVenda" value={formData.lojaVenda} onChange={handleChange} className="input" required />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            Marca veículo
            <input
              name="marcaVeiculo"
              value={formData.marcaVeiculo}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            Versão
            <input name="versao" value={formData.versao} onChange={handleChange} className="input" required />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2">
            Classificação
            <input
              name="classificacao"
              value={formData.classificacao}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            Quantidade
            <input
              type="number"
              min="1"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            Data solicitação
            <input
              placeholder="DD/MM/YYYY"
              name="dataSolicitacao"
              value={formData.dataSolicitacao}
              onChange={handleChange}
              className="input"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            Placa
            <input name="placa" value={formData.placa} onChange={handleChange} className="input" required />
          </label>
          <label className="flex flex-col gap-2">
            Regional
            <input name="regional" value={formData.regional} onChange={handleChange} className="input" required />
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Enviar intenção
        </button>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </section>
  );
}
