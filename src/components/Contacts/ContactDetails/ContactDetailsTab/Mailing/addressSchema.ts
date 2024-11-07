import * as yup from 'yup';

export const addressSchema = yup.object({
  city: yup.string().nullable(),
  country: yup.string().nullable(),
  historic: yup.boolean().nullable(),
  location: yup.string().nullable(),
  metroArea: yup.string().nullable(),
  postalCode: yup.string().nullable(),
  region: yup.string().nullable(),
  state: yup.string().nullable(),
  // Formik ignores test functions defined at the object-level, so this needs to be defined on a
  // specific field. It doesn't matter which field.
  street: yup
    .string()
    .nullable()
    .test(
      'one-field',
      () => 'At least one address field must be filled out',
      (value, { parent: address }) =>
        Boolean(
          address.city ||
            address.country ||
            address.metroArea ||
            address.postalCode ||
            address.region ||
            address.state ||
            address.street,
        ),
    ),
  primaryMailingAddress: yup.boolean().nullable(false),
});

export type AddressSchema = yup.InferType<typeof addressSchema>;
