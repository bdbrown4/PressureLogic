export interface Service {
    name: string;
    checked: boolean;
    subservices?: Service[];
  }