const reverseFiltersOptions = {
  alma_mater: 'reverseAlmaMater',
  appeal: 'reverseAppeal',
  church: 'reverseChurch',
  city: 'reverseCity',
  contact_type: 'reverseContactType',
  country: 'reverseCountry',
  designation_account_id: 'reverseDesignationAccountId',
  donation: 'reverseDonation',
  likely: 'reverseLikely',
  locale: 'reverseLocale',
  metro_area: 'reverseMetroArea',
  pledge_amount: 'reversePledgeAmount',
  pledge_currency: 'reversePledgeCurrency',
  pledge_frequency: 'reversePledgeFrequency',
  referrer: 'reverseReferrer',
  region: 'reverseRegion',
  related_task_action: 'reverseRelatedTaskAction',
  source: 'reverseSource',
  state: 'reverseState',
  status: 'reverseStatus',
  activity_type: 'reverseActivityType',
  contact_appeal: 'reverseContactAppeal',
  contact_church: 'reverseContactChurch',
  contact_city: 'reverseContactCity',
  contact_country: 'reverseContactCountry',
  contact_designation_account_id: 'reverseContactDesignationAccountId',
  contact_ids: 'reverseContactIds',
  contact_likely: 'reverseContactLikely',
  contact_metro_area: 'reverseContactMetroArea',
  contact_pledge_frequency: 'reverseContactPledgeFrequency',
  contact_referrer: 'reverseContactReferrer',
  contact_region: 'reverseContactRegion',
  contact_state: 'reverseContactState',
  contact_status: 'reverseContactStatus',
  contact_timezone: 'reverseContactTimezone',
  next_action: 'reverseNextAction',
  result: 'reverseResult',
  timezone: 'reverseTimezone',
  donation_amount: 'reverseDonationAmount',
  user_ids: 'reverseUserIds',
};

export const renameFilterNames = (name: string | undefined) => {
  switch (name) {
    case 'Referrer':
      return 'Connecting Partner';
    case 'Contact Referrer':
      return 'Contact Connecting Partner';
    default:
      return name;
  }
};

export const reverseFiltersMap = new Map(Object.entries(reverseFiltersOptions));
