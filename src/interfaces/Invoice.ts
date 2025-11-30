import type { IClientReference } from "./Client";

export interface IInvoiceList {
  invoices: IInvoice[];
}

export interface IInvoice {
  id: number;
  invoiceNumber: string;
  type: string;
  description: string;
  link: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  client: IClientReference;
  remittanceId?: number | null;
}

export interface IManualInvoicePayload {
  clientId: number;
  amount: number;
  description: string;
  paymentMethod: string;
  dueDate: string;
}

export interface ILastInvoiceNumber {
  lastInvoiceNumber: number;
}
