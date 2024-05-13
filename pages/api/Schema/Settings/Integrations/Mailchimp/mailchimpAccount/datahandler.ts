import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface MailchimpAccountResponse {
  attributes: Omit<MailchimpAccount, 'id'>;
  id: string;
  type: string;
}

export interface MailchimpAccount {
  id: string;
  active: boolean;
  auto_log_campaigns: boolean;
  created_at: string;
  lists_available_for_newsletters: MailchimpAccountNewsletters;
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

interface MailchimpAccountNewsletters {
  id: string;
  name: string;
}

interface MailchimpAccountCamel {
  id: string;
  active: boolean;
  autoLogCampaigns: boolean;
  createdAt: string;
  listsAvailableForNewsletters: MailchimpAccountNewsletters[];
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

export const MailchimpAccount = (
  data: MailchimpAccountResponse | null,
): MailchimpAccountCamel[] => {
  // Returning inside an array so I can mock an empty response from GraphQL
  // without the test thinking I want it to create custom random test data.
  if (!data) {
    return [];
  }
  const attributes = {} as Omit<MailchimpAccountCamel, 'id'>;
  Object.keys(data.attributes).forEach((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });
  return [
    {
      id: data.id,
      ...attributes,
    },
  ];
};
