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
    username: yup
      .string()
      .when('selectedOrganization', (organization, schema) => {
        if (
          getOrganizationType(organization?.apiClass, organization?.oauth) ===
          OrganizationTypesEnum.LOGIN
        ) {
          return schema.required('Must enter username');
        }
        return schema;
      }),
    password: yup
      .string()
      .when('selectedOrganization', (organization, schema) => {
        if (
          getOrganizationType(organization?.apiClass, organization?.oauth) ===
          OrganizationTypesEnum.LOGIN
        ) {
          return schema.required('Must enter password');
        }
        return schema;
      }),
  });
