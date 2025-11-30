export interface IRemittanceType {
  id: number;
  name: string;
  icon: string;
  generationDay?: number | null;
}

export interface IRemittanceTypesList {
  remittanceTypes: IRemittanceType[];
}

export interface IRemittance {
  id: number;
  status: "validated" | "pending" | "processing_validation";
  month: number;
  year: number;
  remittanceTypeId?: number;
  createdAt?: string;
  validatedAt?: string | null;
  fileUrl?: string | null;
}

export interface IRemittancesList {
  remittances: IRemittance[];
}

export interface IClientReference {
  id: number;
  name: string;
  isActive: boolean;
}

export interface IRemittanceLine {
  id: number;
  remittanceId: number;
  amountMinUnit: number;
  client: IClientReference;
}

export interface IRemittanceLinesList {
  remittanceLines: IRemittanceLine[];
}

export interface IRemittanceTypeClient {
  id: number;
  remittanceTypeId: number;
  amountMinUnit: number;
  client: IClientReference;
}

export interface IRemittanceTypeClientsList {
  remittanceTypeClients: IRemittanceTypeClient[];
}
