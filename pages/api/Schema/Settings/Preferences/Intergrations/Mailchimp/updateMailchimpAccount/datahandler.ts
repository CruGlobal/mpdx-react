import { snakeToCamel } from '../../../../../../../../src//lib/snakeToCamel';

export interface UpdateMailchimpAccountResponse {
  attributes: Omit<UpdateMailchimpAccount, 'id'>;
  id: string;
  type: string;
}

export interface UpdateMailchimpAccount {
  id: string;
  active: boolean;
  auto_log_campaigns: boolean;
  created_at: string;
  lists_available_for_newsletters?: UpdateMailchimpAccountNewsletters[];
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

interface UpdateMailchimpAccountNewsletters {
  id: string;
  name: string;
}

interface UpdateMailchimpAccountCamel {
  id: string;
  active: boolean;
  autoLogCampaigns: boolean;
  createdAt: string;
  listsAvailableForNewsletters?: UpdateMailchimpAccountNewsletters[];
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

export const UpdateMailchimpAccount = (
  data: UpdateMailchimpAccountResponse,
): UpdateMailchimpAccountCamel => {
  const attributes = {} as Omit<UpdateMailchimpAccountCamel, 'id'>;
  Object.keys(data.attributes).map((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });
  return {
    id: data.id,
    ...attributes,
  };
};
