export interface IClientList {
  clients: IClientListItem[];
}

export interface IClientListItem {
  Client: string;
  "Nom Responsable": string;
  "Direcció 1": string;
  "Direcció 2": string;
  Email: string;
  Telèfon: number;
}

export interface IClient {
  Client: string;
  "Nom Responsable": string;
  "Direcció 1": string;
  "Direcció 2": string;
  Email: string;
  Telèfon: string;
  "ID Type": string;
  "ID Value": string;
  IBAN: string;
}
