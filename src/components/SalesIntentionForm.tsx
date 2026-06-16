'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { z } from 'zod';
import { salesIntention } from '@/data/sales-intention';
import type { SalesIntentionPayload } from '@/types/types';
import { createSalesIntention } from '@/lib/salesIntentionApi';

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

const formSchema = z.object({
  proprietario: z.string().trim().min(1, 'Selecione o proprietário'),
  tipoVenda: z.string().trim().min(1, 'Selecione o tipo de venda'),
  bandeira: z.string().trim().min(1, 'Selecione a bandeira'),
  lojaVenda: z.string().trim().min(1, 'Selecione a loja de venda'),
  marcaVeiculo: z.string().trim().min(1, 'Selecione a marca do veículo'),
  versao: z.string().trim().min(1, 'Selecione a versão'),
  classificacao: z.string().trim().min(1, 'Selecione a classificação'),
  quantidade: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade mínima é 1'),
  dataSolicitacao: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Informe a data no formato DD/MM/AAAA'),
  placa: z.string().trim().min(1, 'Informe a placa'),
  regional: z.string().trim().min(1, 'Selecione a regional')
});

type FormErrors = Partial<Record<keyof SalesIntentionPayload, string>>;

function getUniqueOptions(key: keyof SalesIntentionPayload, sourceKey: string) {
  return Array.from(
    new Set(
      salesIntention
        .map((item) => String(item[sourceKey as keyof typeof item] ?? '').trim())
        .filter(Boolean)
    )
  ).sort();
}

function formatDateInput(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

function getDateInputValue(value: string) {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const fieldClasses =
  'w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none ring-1 ring-transparent transition duration-150 focus:border-sky-500 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70';

export default function SalesIntentionForm() {
  const [formData, setFormData] = useState<SalesIntentionPayload>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const options = useMemo(
    () => ({
      proprietario: getUniqueOptions('proprietario', 'Proprietario'),
      tipoVenda: getUniqueOptions('tipoVenda', 'Tipo_Venda'),
      bandeira: getUniqueOptions('bandeira', 'Bandeira'),
      lojaVenda: getUniqueOptions('lojaVenda', 'Loja_Venda'),
      marcaVeiculo: getUniqueOptions('marcaVeiculo', 'Marca_Veiculo'),
      versao: getUniqueOptions('versao', 'Versao'),
      classificacao: getUniqueOptions('classificacao', 'Classificacao'),
      regional: getUniqueOptions('regional', 'Regional')
    }),
    []
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    const nextValue =
      name === 'quantidade'
        ? Number(value)
        : name === 'dataSolicitacao' && type === 'date'
        ? formatDateInput(value)
        : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setErrors({});

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.issues.reduce<FormErrors>((acc, issue) => {
        const field = issue.path[0] as keyof SalesIntentionPayload;
        if (field) acc[field] = issue.message;
        return acc;
      }, {});

      setErrors(fieldErrors);
      setMessage('Revise os campos em destaque e tente novamente.');
      return;
    }

    setIsLoading(true);

    try {
      await createSalesIntention(result.data);
      setFormData(initialValues);
      setMessage('Intenção de venda registrada com sucesso.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro desconhecido ao enviar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/20 sm:p-6">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          Formulário
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Registrar intenção de venda</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Use o envio de dados para cadastrar uma nova intenção no backend. O usuário só pode enviar o formulário nesta tela.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Proprietário
            <select
              name="proprietario"
              value={formData.proprietario}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha o proprietário</option>
              {options.proprietario.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.proprietario ? <span className="text-xs text-rose-600">{errors.proprietario}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Tipo de venda
            <select
              name="tipoVenda"
              value={formData.tipoVenda}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha o tipo</option>
              {options.tipoVenda.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.tipoVenda ? <span className="text-xs text-rose-600">{errors.tipoVenda}</span> : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Bandeira
            <select
              name="bandeira"
              value={formData.bandeira}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a bandeira</option>
              {options.bandeira.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.bandeira ? <span className="text-xs text-rose-600">{errors.bandeira}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Loja de venda
            <select
              name="lojaVenda"
              value={formData.lojaVenda}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a loja</option>
              {options.lojaVenda.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.lojaVenda ? <span className="text-xs text-rose-600">{errors.lojaVenda}</span> : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Marca veículo
            <select
              name="marcaVeiculo"
              value={formData.marcaVeiculo}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a marca</option>
              {options.marcaVeiculo.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.marcaVeiculo ? <span className="text-xs text-rose-600">{errors.marcaVeiculo}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Versão
            <select
              name="versao"
              value={formData.versao}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a versão</option>
              {options.versao.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.versao ? <span className="text-xs text-rose-600">{errors.versao}</span> : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Classificação
            <select
              name="classificacao"
              value={formData.classificacao}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a classificação</option>
              {options.classificacao.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.classificacao ? <span className="text-xs text-rose-600">{errors.classificacao}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Quantidade
            <input
              type="number"
              min={1}
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            />
            {errors.quantidade ? <span className="text-xs text-rose-600">{errors.quantidade}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Data de solicitação
            <input
              type="date"
              name="dataSolicitacao"
              value={getDateInputValue(formData.dataSolicitacao)}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            />
            {errors.dataSolicitacao ? <span className="text-xs text-rose-600">{errors.dataSolicitacao}</span> : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Placa
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            />
            {errors.placa ? <span className="text-xs text-rose-600">{errors.placa}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Regional
            <select
              name="regional"
              value={formData.regional}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading}
            >
              <option value="">Escolha a regional</option>
              {options.regional.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.regional ? <span className="text-xs text-rose-600">{errors.regional}</span> : null}
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Enviando...' : 'Enviar intenção'}
        </button>

        {message ? (
          <p className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
