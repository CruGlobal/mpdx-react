import { StatusEnum } from 'src/graphql/types.generated';

export interface Coordinates {
  id: string;
  name: string;
  avatar: string;
  status?: StatusEnum | null;
  lat?: number;
  lng?: number;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal?: string | null;
  source?: string;
  date?: string;
}
