import { AddressWithPrimary } from '../../../../graphql/types.generated';
import { array, boolean, mixed, object, string } from 'yup';

const getAddressesResponseSchema = object({
  data: object({
    id: string().required(),
    type: string().required(),
    relationships: object({
      addresses: object({
        data: array().of(
          object({ id: string().required(), type: string().required() }),
        ),
      }).required(),
    }).required(),
  }),
  included: array()
    .of(
      object({
        id: string().required(),
        type: string().required(),
        attributes: mixed().required(),
      }),
    )
    .required(),
});

const addressSchema = object({
  primary_mailing_address: boolean().required(),
});

export const readExistingAddresses = (
  response: unknown,
): Array<AddressWithPrimary> => {
  const addresses = getAddressesResponseSchema.validateSync(response);
  return addresses.included
    .filter((included) => included.type === 'addresses')
    .map((address) => {
      const attributes = addressSchema.validateSync(address.attributes);
      return {
        __typename: 'AddressWithPrimary',
        id: address.id,
        primaryMailingAddress: attributes.primary_mailing_address,
      };
    });
};
