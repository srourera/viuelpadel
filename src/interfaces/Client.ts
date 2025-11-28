export interface IResponsible {
  id: number;
  name: string;
}

export interface IClientReference {
  id: number;
  name: string;
}

export interface IResponsibleWithClients {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  clients: IClientReference[];
}

export interface IClientList {
  clients: IClientListItem[];
}

export interface IClientListItem {
  id: number;
  name: string;
  address1: string;
  address2: string;
  email: string;
  phone: string;
  responsible: IResponsible;
}

export interface IClient {
  id: number;
  name: string;
  address1: string;
  address2: string;
  email: string;
  phone: string;
  id_type: string;
  id_value: string;
  bank_mandate_reference: string;
  bank_client_reference: string;
  bank_mandate_signed_at: string;
  iban: string;
  createdAt: string;
  updatedAt: string;
  responsible: IResponsible;
}

export interface INewClientPayload {
  name: string;
  responsible_name?: string;
  address1: string;
  address2: string;
  email: string;
  phone: string;
  id_type: string;
  id_value: string;
  bank_client_reference: string;
  bank_mandate_reference: string;
  bank_mandate_signed_at: string;
  iban: string;
}
