export interface GetPrayerlettersAccountResponse {
  attributes: Omit<GetPrayerlettersAccount, 'id'>;
  id: string;
  type: string;
}

interface GetPrayerlettersAccount {
  id: string;
  created_at: string;
  updated_at: string;
  updated_in_db_at;
  valid_token: boolean;
}

interface GetPrayerlettersAccountCamel {
  id: string;
  validToken: boolean;
}

export const GetPrayerlettersAccount = (
  data: GetPrayerlettersAccountResponse | null,
): GetPrayerlettersAccountCamel[] => {
  // Returning inside an array so I can mock an empty response from GraphQL
  // without the test thinking I want it to create custom random test data.
  if (!data) return [];
  return [
    {
      id: data.id,
      validToken: data.attributes.valid_token,
    },
  ];
};
