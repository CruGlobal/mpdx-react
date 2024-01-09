import * as yup from 'yup';
import { AddressCreateInput } from '../../../../../../../graphql/types.generated';

export const createAddressSchema: yup.SchemaOf<Omit<AddressCreateInput, 'id'>> =
  yup.object({
    contactId: yup.string().required(),
    city: yup.string().nullable(),
    country: yup.string().nullable(),
    historic: yup.boolean().nullable(),
    location: yup.string().nullable(),
    metroArea: yup.string().nullable(),
    postalCode: yup.string().nullable(),
    region: yup.string().nullable(),
    state: yup.string().nullable(),
    street: yup.string().required(),
    primaryMailingAddress: yup.boolean().nullable(false),
  });

export type CreateAddressSchema = yup.InferType<typeof createAddressSchema>;
