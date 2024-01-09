export interface SignatureFields {
    searchFields: string[];
    type: string;
    idFieldFn: () => string;
  }