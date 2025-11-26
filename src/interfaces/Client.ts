export interface IClientList {
  clients: IClient[];
}

export interface IClient {
  Client: string;
  "Nom Responsable": string;
  "Direcció 1": string;
  "Direcció 2": string;
  Email: string;
  Telèfon: number;
}
