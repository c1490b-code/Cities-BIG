export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'official' | 'citizen';
  createdAt: Date;
}

export interface RegistryEntry {
  id: string;
  cityId: string;
  cityName: string;
  region: string;
  representativeUid: string;
  representativeName: string;
  representativeEmail: string;
  termsSigned: boolean;
  licenseSigned: boolean;
  contractSigned: boolean;
  leaseSigned: boolean;
  utilitySigned: boolean;
  presidentialSignature?: string;
  presidentialSeal?: string;
  timestamp: Date;
  status: 'pending' | 'verified' | 'archived';
}
