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
