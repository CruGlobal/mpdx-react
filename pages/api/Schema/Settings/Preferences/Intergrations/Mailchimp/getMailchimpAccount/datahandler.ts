import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface GetMailchimpAccountResponse {
  attributes: Omit<GetMailchimpAccount, 'id'>;
  id: string;
  type: string;
}

export interface GetMailchimpAccount {
  id: string;
  active: boolean;
  auto_log_campaigns: boolean;
  created_at: string;
  lists_available_for_newsletters: GetMailchimpAccountNewsletters;
  lists_link: string;
  lists_present: boolean;
  primary_list_id: string;
  primary_list_name: string;
  updated_at: string;
  updated_in_db_at;
  valid: boolean;
  validate_key: boolean;
  validation_error: string;
}

interface GetMailchimpAccountNewsletters {
  id: string;
  name: string;
}

interface GetMailchimpAccountCamel {
  id: string;
  active: boolean;
  autoLogCampaigns: boolean;
  createdAt: string;
  listsAvailableForNewsletters: GetMailchimpAccountNewsletters;
  listsLink: string;
  listsPresent: boolean;
  primaryListId: string;
  primaryListName: string;
  updatedAt: string;
  updatedInDbAt: string;
  valid: boolean;
  validateKey: boolean;
  validationError: string;
}

export const GetMailchimpAccount = (
  data: GetMailchimpAccountResponse | null,
): GetMailchimpAccountCamel | null => {
  if (!data) return data;
  const attributes = {} as Omit<GetMailchimpAccountCamel, 'id'>;
  Object.keys(data.attributes).map((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });
  return {
    id: data.id,
    ...attributes,
  };
};
