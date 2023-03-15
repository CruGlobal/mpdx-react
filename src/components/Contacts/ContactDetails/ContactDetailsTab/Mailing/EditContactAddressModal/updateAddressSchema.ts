import * as yup from 'yup';
import { AddressUpdateInput } from '../../../../../../../graphql/types.generated';

export const updateAddressSchema: yup.SchemaOf<
  Omit<AddressUpdateInput, 'validValues'>
> = yup.object({
  city: yup.string().nullable(),
  country: yup.string().nullable(),
  historic: yup.boolean().nullable(),
  id: yup.string().required(),
  location: yup.string().nullable(),
  metroArea: yup.string().nullable(),
  postalCode: yup.string().nullable(),
  region: yup.string().nullable(),
  state: yup.string().nullable(),
  street: yup.string().nullable(),
  primaryMailingAddress: yup.boolean().nullable(false),
});

export type UpdateAddressSchema = yup.InferType<typeof updateAddressSchema>;
