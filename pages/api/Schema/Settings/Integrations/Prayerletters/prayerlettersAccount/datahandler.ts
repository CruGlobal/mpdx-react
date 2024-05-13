export interface PrayerlettersAccountResponse {
  attributes: Omit<PrayerlettersAccount, 'id'>;
  id: string;
  type: string;
}

interface PrayerlettersAccount {
  id: string;
  created_at: string;
  updated_at: string;
  updated_in_db_at;
  valid_token: boolean;
}

interface PrayerlettersAccountCamel {
  id: string;
  validToken: boolean;
}

export const PrayerlettersAccount = (
  data: PrayerlettersAccountResponse | null,
): PrayerlettersAccountCamel[] => {
  // Returning inside an array so I can mock an empty response from GraphQL
  // without the test thinking I want it to create custom random test data.
  if (!data) {
    return [];
  }
  return [
    {
      id: data.id,
      validToken: data.attributes.valid_token,
    },
  ];
};
