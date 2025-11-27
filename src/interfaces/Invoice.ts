export interface IInvoiceList {
  invoices: IInvoice[];
}

export interface IInvoice {
  "Número de Factura": string;
  Tipus: string;
  Client: string;
  Descripció: string;
  Import: number;
  Data: string;
  Link: string;
}

export interface IManualInvoicePayload {
  Client: string;
  "Import (IVA inclòs)": number;
  Concepte: string;
  "Mètode pagament": string;
  Venciment: string;
}

export interface ILastInvoiceNumber {
  lastInvoiceNumber: number;
}
