export interface Business {
  id: string;
  name: string;
  description: string;
  slug: string;
  logo_url: string;
  location: string;
  clabe: string;
  bank_name: string;
  bank_holder: string;
  timezone: string;
  created_at: string;
  updated_at?: string;
}

export interface BusinessApi {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  logo_url: string | null;
  url: string;
  beneficiary_clabe: string | null;
  bank_name: string | null;
  beneficiary_name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateBusinessRequest {
  name: string;
  location?: string | null;
  description?: string | null;
}

export interface UpdateBankRequest {
  beneficiary_clabe: string;
  bank_name: string;
  beneficiary_name: string;
}
