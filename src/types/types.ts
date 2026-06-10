import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type TicketMetric = {
  date: string;
  type: "created" | "resolved";
  count: number;
};

export type SalesIntentionPayload = {
  proprietario: string;
  tipoVenda: string;
  bandeira: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  quantidade: number;
  dataSolicitacao: string;
  placa: string;
  regional: string;
};
