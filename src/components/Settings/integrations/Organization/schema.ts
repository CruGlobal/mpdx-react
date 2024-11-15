import * as yup from 'yup';
import { Organization } from 'src/graphql/types.generated';
import {
  OrganizationTypesEnum,
  getOrganizationType,
} from './OrganizationAccordion';

export type OrganizationFormikSchema = {
  selectedOrganization: Pick<
    Organization,
    | 'id'
    | 'name'
    | 'oauth'
    | 'apiClass'
    | 'giftAidPercentage'
    | 'disableNewUsers'
  >;
  username: string | undefined;
  password: string | undefined;
};

export const OrganizationSchema: yup.ObjectSchema<OrganizationFormikSchema> =
  yup.object({
    selectedOrganization: yup
      .object({
        id: yup.string().required(),
        apiClass: yup.string().required(),
        name: yup.string().required(),
        oauth: yup.boolean().required(),
        giftAidPercentage: yup.number().nullable(),
        disableNewUsers: yup.boolean().nullable(),
      })
      .required(),
    username: yup.string().when('selectedOrganization', {
      is: (organization: OrganizationFormikSchema['selectedOrganization']) =>
        getOrganizationType(organization?.apiClass, organization?.oauth) ===
        OrganizationTypesEnum.LOGIN,
      then: (schema) => schema.required('Must enter username'),
    }),
    password: yup.string().when('selectedOrganization', {
      is: (organization: OrganizationFormikSchema['selectedOrganization']) =>
        getOrganizationType(organization?.apiClass, organization?.oauth) ===
        OrganizationTypesEnum.LOGIN,
      then: (schema) => schema.required('Must enter password'),
    }),
  });
