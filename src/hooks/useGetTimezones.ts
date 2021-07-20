export const useGetTimezones = (): Array<Record<string, string>> => {
  const timezones = [
    {
      key: 'American Samoa',
      value: '(GMT-11:00) American Samoa',
    },
    {
      key: 'International Date Line West',
      value: '(GMT-11:00) International Date Line West',
    },
    {
      key: 'Midway Island',
      value: '(GMT-11:00) Midway Island',
    },
    {
      key: 'Samoa',
      value: '(GMT-11:00) Samoa',
    },
    {
      key: 'Hawaii',
      value: '(GMT-10:00) Hawaii',
    },
    {
      key: 'Alaska',
      value: '(GMT-09:00) Alaska',
    },
    {
      key: 'Pacific Time (US & Canada)',
      value: '(GMT-08:00) Pacific Time (US & Canada)',
    },
    {
      key: 'Tijuana',
      value: '(GMT-08:00) Tijuana',
    },
    {
      key: 'Arizona',
      value: '(GMT-07:00) Arizona',
    },
    {
      key: 'Chihuahua',
      value: '(GMT-07:00) Chihuahua',
    },
    {
      key: 'Mazatlan',
      value: '(GMT-07:00) Mazatlan',
    },
    {
      key: 'Mountain Time (US & Canada)',
      value: '(GMT-07:00) Mountain Time (US & Canada)',
    },
    {
      key: 'Central America',
      value: '(GMT-06:00) Central America',
    },
    {
      key: 'Central Time (US & Canada)',
      value: '(GMT-06:00) Central Time (US & Canada)',
    },
    {
      key: 'Guadalajara',
      value: '(GMT-06:00) Guadalajara',
    },
    {
      key: 'Mexico City',
      value: '(GMT-06:00) Mexico City',
    },
    {
      key: 'Monterrey',
      value: '(GMT-06:00) Monterrey',
    },
    {
      key: 'Saskatchewan',
      value: '(GMT-06:00) Saskatchewan',
    },
    {
      key: 'Bogota',
      value: '(GMT-05:00) Bogota',
    },
    {
      key: 'Eastern Time (US & Canada)',
      value: '(GMT-05:00) Eastern Time (US & Canada)',
    },
    {
      key: 'Indiana (East)',
      value: '(GMT-05:00) Indiana (East)',
    },
    {
      key: 'Lima',
      value: '(GMT-05:00) Lima',
    },
    {
      key: 'Quito',
      value: '(GMT-05:00) Quito',
    },
    {
      key: 'Atlantic Time (Canada)',
      value: '(GMT-04:00) Atlantic Time (Canada)',
    },
    {
      key: 'Caracas',
      value: '(GMT-04:00) Caracas',
    },
    {
      key: 'Georgetown',
      value: '(GMT-04:00) Georgetown',
    },
    {
      key: 'La Paz',
      value: '(GMT-04:00) La Paz',
    },
    {
      key: 'Santiago',
      value: '(GMT-04:00) Santiago',
    },
    {
      key: 'Newfoundland',
      value: '(GMT-03:30) Newfoundland',
    },
    {
      key: 'Brasilia',
      value: '(GMT-03:00) Brasilia',
    },
    {
      key: 'Buenos Aires',
      value: '(GMT-03:00) Buenos Aires',
    },
    {
      key: 'Greenland',
      value: '(GMT-03:00) Greenland',
    },
    {
      key: 'Montevideo',
      value: '(GMT-03:00) Montevideo',
    },
    {
      key: 'Mid-Atlantic',
      value: '(GMT-02:00) Mid-Atlantic',
    },
    {
      key: 'Azores',
      value: '(GMT-01:00) Azores',
    },
    {
      key: 'Cape Verde Is.',
      value: '(GMT-01:00) Cape Verde Is.',
    },
    {
      key: 'Casablanca',
      value: '(GMT+00:00) Casablanca',
    },
    {
      key: 'Dublin',
      value: '(GMT+00:00) Dublin',
    },
    {
      key: 'Edinburgh',
      value: '(GMT+00:00) Edinburgh',
    },
    {
      key: 'Lisbon',
      value: '(GMT+00:00) Lisbon',
    },
    {
      key: 'London',
      value: '(GMT+00:00) London',
    },
    {
      key: 'Monrovia',
      value: '(GMT+00:00) Monrovia',
    },
    {
      key: 'UTC',
      value: '(GMT+00:00) UTC',
    },
    {
      key: 'Amsterdam',
      value: '(GMT+01:00) Amsterdam',
    },
    {
      key: 'Belgrade',
      value: '(GMT+01:00) Belgrade',
    },
    {
      key: 'Berlin',
      value: '(GMT+01:00) Berlin',
    },
    {
      key: 'Bern',
      value: '(GMT+01:00) Bern',
    },
    {
      key: 'Bratislava',
      value: '(GMT+01:00) Bratislava',
    },
    {
      key: 'Brussels',
      value: '(GMT+01:00) Brussels',
    },
    {
      key: 'Budapest',
      value: '(GMT+01:00) Budapest',
    },
    {
      key: 'Copenhagen',
      value: '(GMT+01:00) Copenhagen',
    },
    {
      key: 'Ljubljana',
      value: '(GMT+01:00) Ljubljana',
    },
    {
      key: 'Madrid',
      value: '(GMT+01:00) Madrid',
    },
    {
      key: 'Paris',
      value: '(GMT+01:00) Paris',
    },
    {
      key: 'Prague',
      value: '(GMT+01:00) Prague',
    },
    {
      key: 'Rome',
      value: '(GMT+01:00) Rome',
    },
    {
      key: 'Sarajevo',
      value: '(GMT+01:00) Sarajevo',
    },
    {
      key: 'Skopje',
      value: '(GMT+01:00) Skopje',
    },
    {
      key: 'Stockholm',
      value: '(GMT+01:00) Stockholm',
    },
    {
      key: 'Vienna',
      value: '(GMT+01:00) Vienna',
    },
    {
      key: 'Warsaw',
      value: '(GMT+01:00) Warsaw',
    },
    {
      key: 'West Central Africa',
      value: '(GMT+01:00) West Central Africa',
    },
    {
      key: 'Zagreb',
      value: '(GMT+01:00) Zagreb',
    },
    {
      key: 'Athens',
      value: '(GMT+02:00) Athens',
    },
    {
      key: 'Bucharest',
      value: '(GMT+02:00) Bucharest',
    },
    {
      key: 'Cairo',
      value: '(GMT+02:00) Cairo',
    },
    {
      key: 'Harare',
      value: '(GMT+02:00) Harare',
    },
    {
      key: 'Helsinki',
      value: '(GMT+02:00) Helsinki',
    },
    {
      key: 'Istanbul',
      value: '(GMT+02:00) Istanbul',
    },
    {
      key: 'Jerusalem',
      value: '(GMT+02:00) Jerusalem',
    },
    {
      key: 'Kaliningrad',
      value: '(GMT+02:00) Kaliningrad',
    },
    {
      key: 'Kyiv',
      value: '(GMT+02:00) Kyiv',
    },
    {
      key: 'Pretoria',
      value: '(GMT+02:00) Pretoria',
    },
    {
      key: 'Riga',
      value: '(GMT+02:00) Riga',
    },
    {
      key: 'Sofia',
      value: '(GMT+02:00) Sofia',
    },
    {
      key: 'Tallinn',
      value: '(GMT+02:00) Tallinn',
    },
    {
      key: 'Vilnius',
      value: '(GMT+02:00) Vilnius',
    },
    {
      key: 'Baghdad',
      value: '(GMT+03:00) Baghdad',
    },
    {
      key: 'Kuwait',
      value: '(GMT+03:00) Kuwait',
    },
    {
      key: 'Minsk',
      value: '(GMT+03:00) Minsk',
    },
    {
      key: 'Moscow',
      value: '(GMT+03:00) Moscow',
    },
    {
      key: 'Nairobi',
      value: '(GMT+03:00) Nairobi',
    },
    {
      key: 'Riyadh',
      value: '(GMT+03:00) Riyadh',
    },
    {
      key: 'St. Petersburg',
      value: '(GMT+03:00) St. Petersburg',
    },
    {
      key: 'Volgograd',
      value: '(GMT+03:00) Volgograd',
    },
    {
      key: 'Tehran',
      value: '(GMT+03:30) Tehran',
    },
    {
      key: 'Abu Dhabi',
      value: '(GMT+04:00) Abu Dhabi',
    },
    {
      key: 'Baku',
      value: '(GMT+04:00) Baku',
    },
    {
      key: 'Muscat',
      value: '(GMT+04:00) Muscat',
    },
    {
      key: 'Samara',
      value: '(GMT+04:00) Samara',
    },
    {
      key: 'Tbilisi',
      value: '(GMT+04:00) Tbilisi',
    },
    {
      key: 'Yerevan',
      value: '(GMT+04:00) Yerevan',
    },
    {
      key: 'Kabul',
      value: '(GMT+04:30) Kabul',
    },
    {
      key: 'Ekaterinburg',
      value: '(GMT+05:00) Ekaterinburg',
    },
    {
      key: 'Islamabad',
      value: '(GMT+05:00) Islamabad',
    },
    {
      key: 'Karachi',
      value: '(GMT+05:00) Karachi',
    },
    {
      key: 'Tashkent',
      value: '(GMT+05:00) Tashkent',
    },
    {
      key: 'Chennai',
      value: '(GMT+05:30) Chennai',
    },
    {
      key: 'Kolkata',
      value: '(GMT+05:30) Kolkata',
    },
    {
      key: 'Mumbai',
      value: '(GMT+05:30) Mumbai',
    },
    {
      key: 'New Delhi',
      value: '(GMT+05:30) New Delhi',
    },
    {
      key: 'Sri Jayawardenepura',
      value: '(GMT+05:30) Sri Jayawardenepura',
    },
    {
      key: 'Kathmandu',
      value: '(GMT+05:45) Kathmandu',
    },
    {
      key: 'Almaty',
      value: '(GMT+06:00) Almaty',
    },
    {
      key: 'Astana',
      value: '(GMT+06:00) Astana',
    },
    {
      key: 'Dhaka',
      value: '(GMT+06:00) Dhaka',
    },
    {
      key: 'Urumqi',
      value: '(GMT+06:00) Urumqi',
    },
    {
      key: 'Rangoon',
      value: '(GMT+06:30) Rangoon',
    },
    {
      key: 'Bangkok',
      value: '(GMT+07:00) Bangkok',
    },
    {
      key: 'Hanoi',
      value: '(GMT+07:00) Hanoi',
    },
    {
      key: 'Jakarta',
      value: '(GMT+07:00) Jakarta',
    },
    {
      key: 'Krasnoyarsk',
      value: '(GMT+07:00) Krasnoyarsk',
    },
    {
      key: 'Novosibirsk',
      value: '(GMT+07:00) Novosibirsk',
    },
    {
      key: 'Beijing',
      value: '(GMT+08:00) Beijing',
    },
    {
      key: 'Chongqing',
      value: '(GMT+08:00) Chongqing',
    },
    {
      key: 'Hong Kong',
      value: '(GMT+08:00) Hong Kong',
    },
    {
      key: 'Irkutsk',
      value: '(GMT+08:00) Irkutsk',
    },
    {
      key: 'Kuala Lumpur',
      value: '(GMT+08:00) Kuala Lumpur',
    },
    {
      key: 'Perth',
      value: '(GMT+08:00) Perth',
    },
    {
      key: 'Singapore',
      value: '(GMT+08:00) Singapore',
    },
    {
      key: 'Taipei',
      value: '(GMT+08:00) Taipei',
    },
    {
      key: 'Ulaanbaatar',
      value: '(GMT+08:00) Ulaanbaatar',
    },
    {
      key: 'Osaka',
      value: '(GMT+09:00) Osaka',
    },
    {
      key: 'Sapporo',
      value: '(GMT+09:00) Sapporo',
    },
    {
      key: 'Seoul',
      value: '(GMT+09:00) Seoul',
    },
    {
      key: 'Tokyo',
      value: '(GMT+09:00) Tokyo',
    },
    {
      key: 'Yakutsk',
      value: '(GMT+09:00) Yakutsk',
    },
    {
      key: 'Adelaide',
      value: '(GMT+09:30) Adelaide',
    },
    {
      key: 'Darwin',
      value: '(GMT+09:30) Darwin',
    },
    {
      key: 'Brisbane',
      value: '(GMT+10:00) Brisbane',
    },
    {
      key: 'Canberra',
      value: '(GMT+10:00) Canberra',
    },
    {
      key: 'Guam',
      value: '(GMT+10:00) Guam',
    },
    {
      key: 'Hobart',
      value: '(GMT+10:00) Hobart',
    },
    {
      key: 'Melbourne',
      value: '(GMT+10:00) Melbourne',
    },
    {
      key: 'Port Moresby',
      value: '(GMT+10:00) Port Moresby',
    },
    {
      key: 'Sydney',
      value: '(GMT+10:00) Sydney',
    },
    {
      key: 'Vladivostok',
      value: '(GMT+10:00) Vladivostok',
    },
    {
      key: 'Magadan',
      value: '(GMT+11:00) Magadan',
    },
    {
      key: 'New Caledonia',
      value: '(GMT+11:00) New Caledonia',
    },
    {
      key: 'Solomon Is.',
      value: '(GMT+11:00) Solomon Is.',
    },
    {
      key: 'Srednekolymsk',
      value: '(GMT+11:00) Srednekolymsk',
    },
    {
      key: 'Auckland',
      value: '(GMT+12:00) Auckland',
    },
    {
      key: 'Fiji',
      value: '(GMT+12:00) Fiji',
    },
    {
      key: 'Kamchatka',
      value: '(GMT+12:00) Kamchatka',
    },
    {
      key: 'Marshall Is.',
      value: '(GMT+12:00) Marshall Is.',
    },
    {
      key: 'Wellington',
      value: '(GMT+12:00) Wellington',
    },
    {
      key: 'Chatham Is.',
      value: '(GMT+12:45) Chatham Is.',
    },
    {
      key: "Nuku'alofa",
      value: "(GMT+13:00) Nuku'alofa",
    },
    {
      key: 'Tokelau Is.',
      value: '(GMT+13:00) Tokelau Is.',
    },
  ];
  return timezones;
};
