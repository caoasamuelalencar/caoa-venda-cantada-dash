'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { z } from 'zod';

import { salesIntention } from '@/data/sales-intention';
import useCurrentUser from '@/hooks/useCurrentUser';
import { createSalesIntention } from '@/lib/salesIntentionApi';
import type { SalesIntentionPayload } from '@/types/types';

const typeVendaOptions = [
  { value: 'NOVOS', label: 'Novos' },
  { value: 'SEMINOVOS', label: 'Seminovos' }
];

const bandeiraOptions = ['CAOA CHERY', 'SHANGAN', 'HYUNDAI'];

const regionalOptions = ['Regional A', 'Regional B', 'Regional C'];

const lojaVendaOptionsByRegional: Record<string, string[]> = {
  'Regional A': ['A1', 'A2', 'A3', 'A4', 'A5'],
  'Regional B': ['B1', 'B2', 'B3', 'B4', 'B5'],
  'Regional C': ['C1', 'C2', 'C3', 'C4', 'C5']
};

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

type SalesIntentionFormData = SalesIntentionPayload & {
  ano: string;
  modelo: string;
};

type FormErrors = Partial<Record<keyof SalesIntentionFormData, string>>;

type NotificationVariant = 'success' | 'error' | 'warning' | 'loading';

type NotificationState = {
  open: boolean;
  variant: NotificationVariant;
  title: string;
  description: string;
};

const defaultNotification: NotificationState = {
  open: false,
  variant: 'success',
  title: '',
  description: ''
};

function normalizeValue(value: string) {
  return value.trim().toUpperCase();
}

function buildFormSchema(currentOwner: string) {
  return z
    .object({
    proprietario: z
      .string()
      .trim()
      .min(1, 'O proprietário é preenchido automaticamente com o usuário logado')
      .refine((value) => normalizeValue(value) === normalizeValue(currentOwner), {
        message: 'O proprietário precisa ser o usuário logado'
      }),
    tipoVenda: z.string().trim().min(1, 'Selecione o tipo de venda'),
    bandeira: z.string().trim().min(1, 'Selecione a bandeira'),
    lojaVenda: z.string().trim().min(1, 'Selecione a loja de venda'),
    marcaVeiculo: z.string().trim().min(1, 'Selecione a marca do veículo'),
    versao: z.string().trim().min(1, 'Selecione a versão'),
    classificacao: z.string().trim().min(1, 'Selecione a classificação'),
    quantidade: z.number().int('Quantidade deve ser um número inteiro').min(1, 'Quantidade mínima é 1'),
    dataSolicitacao: z
      .string()
      .trim()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Informe a data no formato DD/MM/AAAA'),
    placa: z.string().trim().min(1, 'Informe a placa'),
    regional: z.string().trim().min(1, 'Selecione a regional'),
    ano: z.string().trim(),
    modelo: z.string().trim()
    })
    .superRefine((data, ctx) => {
      if (data.tipoVenda === 'NOVOS' && data.placa !== '-') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['placa'],
          message: 'Para veículos novos, a placa deve ser preenchida com -'
        });
      }

      if (data.tipoVenda === 'SEMINOVOS' && !isBrazilPlate(data.placa)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['placa'],
          message: 'Informe a placa no padrão brasileiro: AAA-1234'
        });
      }

      if (data.tipoVenda === 'SEMINOVOS') {
        if (!data.ano) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ano'],
            message: 'Selecione o ano do veículo'
          });
        }

        if (!data.modelo) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['modelo'],
            message: 'Selecione o modelo do veículo'
          });
        }
      }
    });
}

function getFilteredOptions(sourceKey: string, filters: Record<string, string>) {
  return Array.from(
    new Set(
      salesIntention
        .filter((item) =>
          Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            return normalizeValue(String(item[key as keyof typeof item] ?? '')) === normalizeValue(value);
          })
        )
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

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const firstYear = 1950;
  return Array.from({ length: currentYear - firstYear + 2 }, (_, index) =>
    String(currentYear + 1 - index)
  );
}

function getAdjacentYearOptions(selectedYear: string, allYears: string[]) {
  if (!selectedYear) {
    return allYears;
  }

  const yearNumber = Number(selectedYear);
  if (Number.isNaN(yearNumber)) {
    return allYears;
  }

  const allowedYears = new Set([yearNumber - 1, yearNumber, yearNumber + 1].map(String));
  return allYears.filter((year) => allowedYears.has(year));
}

function formatBrazilPlateInput(value: string) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (cleaned.length <= 3) {
    return cleaned;
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

function isBrazilPlate(value: string) {
  return /^[A-Z0-9]{3}-[A-Z0-9]{4}$/.test(value.trim().toUpperCase());
}

const fieldClasses =
  'w-full min-h-14 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none ring-1 ring-transparent transition duration-150 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-80 sm:rounded-3xl';

export default function SalesIntentionForm() {
  const { user, loading: isUserLoading } = useCurrentUser();
  const [formData, setFormData] = useState<SalesIntentionFormData>({ ...initialValues, ano: '', modelo: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(defaultNotification);
  const yearOptions = useMemo(() => getYearOptions(), []);
  const anoOptions = useMemo(
    () => getAdjacentYearOptions(formData.modelo, yearOptions),
    [formData.modelo, yearOptions]
  );
  const modeloOptions = useMemo(
    () => getAdjacentYearOptions(formData.ano, yearOptions),
    [formData.ano, yearOptions]
  );

  const currentOwner = useMemo(() => {
    const userEmail = user?.email?.trim() ?? '';
    const userName = user?.name?.trim() ?? '';
    return userEmail || userName;
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (!currentOwner) return;

      setFormData((current) =>
        current.proprietario === currentOwner ? current : { ...current, proprietario: currentOwner }
    );
  }, [currentOwner]);

  useEffect(() => {
    if (!notification.open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [notification.open]);

  useEffect(() => {
    setFormData((current) => {
      if (current.tipoVenda === 'NOVOS' && current.placa !== '-') {
        return { ...current, placa: '-', ano: '', modelo: '' };
      }

      if (current.tipoVenda === 'SEMINOVOS' && current.placa === '-') {
        return { ...current, placa: '' };
      }

      return current;
    });
  }, [formData.tipoVenda]);

  const filteredOptions = useMemo(
    () => ({
      tipoVenda: typeVendaOptions,
      bandeira: bandeiraOptions,
      lojaVenda: lojaVendaOptionsByRegional[formData.regional] ?? [],
      marcaVeiculo: getFilteredOptions('Marca_Veiculo', { Tipo_Venda: formData.tipoVenda }),
      versao: getFilteredOptions('Versao', { Tipo_Venda: formData.tipoVenda, Marca_Veiculo: formData.marcaVeiculo }),
      classificacao: getFilteredOptions('Classificacao', {})
    }),
    [formData.marcaVeiculo, formData.regional, formData.tipoVenda]
  );

  const vehicleHelpText =
    formData.tipoVenda === 'NOVOS'
      ? 'Mostrando apenas veículos zero quilômetro.'
      : formData.tipoVenda === 'SEMINOVOS'
        ? 'Mostrando apenas veículos seminovos.'
        : 'Escolha o tipo de venda para liberar os veículos.';
  const showSeminovosFields = formData.tipoVenda === 'SEMINOVOS';
  const closeNotification = () => setNotification(defaultNotification);

  const openNotification = (variant: NotificationVariant, title: string, description: string) => {
    setNotification({
      open: true,
      variant,
      title,
      description
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    const nextValue =
      name === 'quantidade'
        ? Number(value)
        : name === 'dataSolicitacao' && type === 'date'
          ? formatDateInput(value)
          : name === 'placa'
            ? formatBrazilPlateInput(value)
          : value;

    setFormData((current) => {
      const nextFormData = {
        ...current,
        [name]: nextValue,
        ...(name === 'tipoVenda' ? { bandeira: '', marcaVeiculo: '', versao: '', ano: '', modelo: '' } : {}),
        ...(name === 'regional' ? { lojaVenda: '' } : {}),
        ...(name === 'marcaVeiculo' ? { versao: '' } : {})
      };

      if (name === 'ano') {
        const allowedModelos = getAdjacentYearOptions(String(nextValue), yearOptions);
        if (nextFormData.modelo && !allowedModelos.includes(nextFormData.modelo)) {
          nextFormData.modelo = '';
        }
      }

      if (name === 'modelo') {
        const allowedAnos = getAdjacentYearOptions(String(nextValue), yearOptions);
        if (nextFormData.ano && !allowedAnos.includes(nextFormData.ano)) {
          nextFormData.ano = '';
        }
      }

      return nextFormData;
    });

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'ano' ? { modelo: undefined } : {}),
      ...(name === 'modelo' ? { ano: undefined } : {})
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const formSchema = buildFormSchema(currentOwner);
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.issues.reduce<FormErrors>((acc, issue) => {
        const field = issue.path[0] as keyof SalesIntentionFormData;
        if (field) acc[field] = issue.message;
        return acc;
      }, {});

      setErrors(fieldErrors);
      openNotification(
        'warning',
        'Revise os campos',
        'Ainda faltam informações obrigatórias. Veja os campos marcados antes de enviar novamente.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const { ano: _ano, modelo: _modelo, ...payload } = result.data;
      await createSalesIntention(payload);
      setFormData({ ...initialValues, ano: '', modelo: '', proprietario: currentOwner });
      openNotification(
        'success',
        'Intenção enviada',
        'Sua intenção foi registrada com sucesso. Você pode cadastrar outra em seguida.'
      );
    } catch (error) {
      openNotification(
        'error',
        'Não foi possível enviar',
        error instanceof Error ? error.message : 'Erro desconhecido ao enviar.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnerLocked = isUserLoading || !currentOwner;
  const selectedLojaOptions = formData.regional ? lojaVendaOptionsByRegional[formData.regional] ?? [] : [];
  const notificationTone = notification.variant === 'success'
    ? {
        container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
        pill: 'bg-emerald-600 text-white',
        icon: CheckCircle2,
        iconClass: 'text-emerald-600'
      }
    : notification.variant === 'warning'
      ? {
          container: 'border-amber-200 bg-amber-50 text-amber-950',
          pill: 'bg-amber-600 text-white',
          icon: TriangleAlert,
          iconClass: 'text-amber-600'
        }
      : notification.variant === 'loading'
        ? {
            container: 'border-sky-200 bg-sky-50 text-sky-950',
            pill: 'bg-sky-600 text-white',
            icon: LoaderCircle,
            iconClass: 'text-sky-600 animate-spin'
          }
        : {
            container: 'border-rose-200 bg-rose-50 text-rose-950',
            pill: 'bg-rose-600 text-white',
            icon: AlertCircle,
            iconClass: 'text-rose-600'
          };
  const NotificationIcon = notificationTone.icon;

  return (
    <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-none border-0 bg-white shadow-none sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-xl">
      <div className="border-b border-slate-200 bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
          Formulário
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Registrar intenção de venda</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
          Preencha com poucos toques. O layout foi pensado para uso direto no celular, com campos largos e leitura rápida.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Proprietário
            <input
              name="proprietario"
              value={formData.proprietario}
              readOnly
              placeholder={isOwnerLocked ? 'Carregando usuário logado...' : ''}
              className={fieldClasses}
              disabled={isLoading || isOwnerLocked}
            />
            {errors.proprietario ? <span className="text-xs text-rose-600">{errors.proprietario}</span> : null}
          </label>
        </div>

        <div className="grid gap-4">
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
              {filteredOptions.tipoVenda.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.tipoVenda ? <span className="text-xs text-rose-600">{errors.tipoVenda}</span> : null}
          </label>
        </div>

        <div className="grid gap-4">
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
              {regionalOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.regional ? <span className="text-xs text-rose-600">{errors.regional}</span> : null}
          </label>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Loja de venda
            <select
              name="lojaVenda"
              value={formData.lojaVenda}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading || !formData.regional}
            >
              <option value="">Escolha a loja</option>
              {selectedLojaOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.lojaVenda ? <span className="text-xs text-rose-600">{errors.lojaVenda}</span> : null}
          </label>
        </div>

        <div className="grid gap-4">
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
              {filteredOptions.bandeira.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.bandeira ? <span className="text-xs text-rose-600">{errors.bandeira}</span> : null}
          </label>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Marca veículo
            <select
              name="marcaVeiculo"
              value={formData.marcaVeiculo}
              onChange={handleChange}
              className={fieldClasses}
              disabled={isLoading || !formData.tipoVenda}
            >
              <option value="">Escolha a marca</option>
              {filteredOptions.marcaVeiculo.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">{vehicleHelpText}</span>
            {errors.marcaVeiculo ? <span className="text-xs text-rose-600">{errors.marcaVeiculo}</span> : null}
          </label>
        </div>

        {showSeminovosFields ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Ano
                <select
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading}
                >
                  <option value="">Selecione o ano</option>
                  {anoOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.ano ? <span className="text-xs text-rose-600">{errors.ano}</span> : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Modelo
                <select
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading}
                >
                  <option value="">Selecione o modelo</option>
                  {modeloOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.modelo ? <span className="text-xs text-rose-600">{errors.modelo}</span> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Versão
                <select
                  name="versao"
                  value={formData.versao}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading || !formData.marcaVeiculo}
                >
                  <option value="">Escolha a versão</option>
                  {filteredOptions.versao.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">{vehicleHelpText}</span>
                {errors.versao ? <span className="text-xs text-rose-600">{errors.versao}</span> : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Placa
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading}
                  placeholder="AAA-1234"
                  maxLength={8}
                  inputMode="text"
                  autoComplete="off"
                />
                {errors.placa ? <span className="text-xs text-rose-600">{errors.placa}</span> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  {filteredOptions.classificacao.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.classificacao ? <span className="text-xs text-rose-600">{errors.classificacao}</span> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                {errors.dataSolicitacao ? (
                  <span className="text-xs text-rose-600">{errors.dataSolicitacao}</span>
                ) : null}
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Versão
                <select
                  name="versao"
                  value={formData.versao}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading || !formData.marcaVeiculo}
                >
                  <option value="">Escolha a versão</option>
                  {filteredOptions.versao.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">{vehicleHelpText}</span>
                {errors.versao ? <span className="text-xs text-rose-600">{errors.versao}</span> : null}
              </label>

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
                  {filteredOptions.classificacao.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.classificacao ? <span className="text-xs text-rose-600">{errors.classificacao}</span> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
                {errors.dataSolicitacao ? (
                  <span className="text-xs text-rose-600">{errors.dataSolicitacao}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Placa
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className={fieldClasses}
                  disabled={isLoading || formData.tipoVenda === 'NOVOS'}
                  placeholder={formData.tipoVenda === 'NOVOS' ? '-' : 'AAA-1234'}
                  maxLength={8}
                  inputMode="text"
                  autoComplete="off"
                />
                {errors.placa ? <span className="text-xs text-rose-600">{errors.placa}</span> : null}
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || isOwnerLocked}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-700 px-5 py-4 text-base font-semibold text-white transition hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-3xl"
        >
          {isLoading ? 'Enviando...' : 'Enviar intenção'}
        </button>
      </form>

      {notification.open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className={`w-full max-w-lg overflow-hidden rounded-[28px] border shadow-2xl ${notificationTone.container}`}>
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${notificationTone.pill}`}>
                <NotificationIcon className={`h-6 w-6 ${notificationTone.iconClass}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">Status do envio</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{notification.title}</h2>
                <p className="mt-2 text-sm leading-6 opacity-90">{notification.description}</p>
              </div>
              <button
                type="button"
                onClick={closeNotification}
                className="rounded-full p-2 transition hover:bg-black/5"
                aria-label="Fechar mensagem"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-black/10 bg-white/50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeNotification}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
