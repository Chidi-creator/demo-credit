export interface KYCSubmissionData {
  phone_number: string;
  bvn: string;
  bvn_phone_number: string;
  dob: string; 
  email: string;
  account_number: string;
  bank_code: string;
  state: string;
  lga: string;
  city: string;
  address: string;
  photo_url: string;
  documents: KYCDocument[];
}

export interface KYCDocument {
  url: string;
  type_id: number;
  sub_type_id: number;
}
