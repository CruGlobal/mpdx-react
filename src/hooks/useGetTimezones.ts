import i18n from 'i18next';

export const useGetTimezones = (): Array<Record<string, string>> => {
  const timezones = [
    {
      key: 'American Samoa',
      value: i18n.t('(GMT-11:00) American Samoa'),
    },
    {
      key: 'International Date Line West',
      value: i18n.t('(GMT-11:00) International Date Line West'),
    },
    {
      key: 'Midway Island',
      value: i18n.t('(GMT-11:00) Midway Island'),
    },
    {
      key: 'Samoa',
      value: i18n.t('(GMT-11:00) Samoa'),
    },
    {
      key: 'Hawaii',
      value: i18n.t('(GMT-10:00) Hawaii'),
    },
    {
      key: 'Alaska',
      value: i18n.t('(GMT-09:00) Alaska'),
    },
    {
      key: 'Pacific Time (US & Canada)',
      value: i18n.t('(GMT-08:00) Pacific Time (US & Canada)'),
    },
    {
      key: 'Tijuana',
      value: i18n.t('(GMT-08:00) Tijuana'),
    },
    {
      key: 'Arizona',
      value: i18n.t('(GMT-07:00) Arizona'),
    },
    {
      key: 'Chihuahua',
      value: i18n.t('(GMT-07:00) Chihuahua'),
    },
    {
      key: 'Mazatlan',
      value: i18n.t('(GMT-07:00) Mazatlan'),
    },
    {
      key: 'Mountain Time (US & Canada)',
      value: i18n.t('(GMT-07:00) Mountain Time (US & Canada)'),
    },
    {
      key: 'Central America',
      value: i18n.t('(GMT-06:00) Central America'),
    },
    {
      key: 'Central Time (US & Canada)',
      value: i18n.t('(GMT-06:00) Central Time (US & Canada)'),
    },
    {
      key: 'Guadalajara',
      value: i18n.t('(GMT-06:00) Guadalajara'),
    },
    {
      key: 'Mexico City',
      value: i18n.t('(GMT-06:00) Mexico City'),
    },
    {
      key: 'Monterrey',
      value: i18n.t('(GMT-06:00) Monterrey'),
    },
    {
      key: 'Saskatchewan',
      value: i18n.t('(GMT-06:00) Saskatchewan'),
    },
    {
      key: 'Bogota',
      value: i18n.t('(GMT-05:00) Bogota'),
    },
    {
      key: 'Eastern Time (US & Canada)',
      value: i18n.t('(GMT-05:00) Eastern Time (US & Canada)'),
    },
    {
      key: 'Indiana (East)',
      value: i18n.t('(GMT-05:00) Indiana (East)'),
    },
    {
      key: 'Lima',
      value: i18n.t('(GMT-05:00) Lima'),
    },
    {
      key: 'Quito',
      value: i18n.t('(GMT-05:00) Quito'),
    },
    {
      key: 'Atlantic Time (Canada)',
      value: i18n.t('(GMT-04:00) Atlantic Time (Canada)'),
    },
    {
      key: 'Caracas',
      value: i18n.t('(GMT-04:00) Caracas'),
    },
    {
      key: 'Georgetown',
      value: i18n.t('(GMT-04:00) Georgetown'),
    },
    {
      key: 'La Paz',
      value: i18n.t('(GMT-04:00) La Paz'),
    },
    {
      key: 'Santiago',
      value: i18n.t('(GMT-04:00) Santiago'),
    },
    {
      key: 'Newfoundland',
      value: i18n.t('(GMT-03:30) Newfoundland'),
    },
    {
      key: 'Brasilia',
      value: i18n.t('(GMT-03:00) Brasilia'),
    },
    {
      key: 'Buenos Aires',
      value: i18n.t('(GMT-03:00) Buenos Aires'),
    },
    {
      key: 'Greenland',
      value: i18n.t('(GMT-03:00) Greenland'),
    },
    {
      key: 'Montevideo',
      value: i18n.t('(GMT-03:00) Montevideo'),
    },
    {
      key: 'Mid-Atlantic',
      value: i18n.t('(GMT-02:00) Mid-Atlantic'),
    },
    {
      key: 'Azores',
      value: i18n.t('(GMT-01:00) Azores'),
    },
    {
      key: 'Cape Verde Is.',
      value: i18n.t('(GMT-01:00) Cape Verde Is.'),
    },
    {
      key: 'Casablanca',
      value: i18n.t('(GMT+00:00) Casablanca'),
    },
    {
      key: 'Dublin',
      value: i18n.t('(GMT+00:00) Dublin'),
    },
    {
      key: 'Edinburgh',
      value: i18n.t('(GMT+00:00) Edinburgh'),
    },
    {
      key: 'Lisbon',
      value: i18n.t('(GMT+00:00) Lisbon'),
    },
    {
      key: 'London',
      value: i18n.t('(GMT+00:00) London'),
    },
    {
      key: 'Monrovia',
      value: i18n.t('(GMT+00:00) Monrovia'),
    },
    {
      key: 'UTC',
      value: i18n.t('(GMT+00:00) UTC'),
    },
    {
      key: 'Amsterdam',
      value: i18n.t('(GMT+01:00) Amsterdam'),
    },
    {
      key: 'Belgrade',
      value: i18n.t('(GMT+01:00) Belgrade'),
    },
    {
      key: 'Berlin',
      value: i18n.t('(GMT+01:00) Berlin'),
    },
    {
      key: 'Bern',
      value: i18n.t('(GMT+01:00) Bern'),
    },
    {
      key: 'Bratislava',
      value: i18n.t('(GMT+01:00) Bratislava'),
    },
    {
      key: 'Brussels',
      value: i18n.t('(GMT+01:00) Brussels'),
    },
    {
      key: 'Budapest',
      value: i18n.t('(GMT+01:00) Budapest'),
    },
    {
      key: 'Copenhagen',
      value: i18n.t('(GMT+01:00) Copenhagen'),
    },
    {
      key: 'Ljubljana',
      value: i18n.t('(GMT+01:00) Ljubljana'),
    },
    {
      key: 'Madrid',
      value: i18n.t('(GMT+01:00) Madrid'),
    },
    {
      key: 'Paris',
      value: i18n.t('(GMT+01:00) Paris'),
    },
    {
      key: 'Prague',
      value: i18n.t('(GMT+01:00) Prague'),
    },
    {
      key: 'Rome',
      value: i18n.t('(GMT+01:00) Rome'),
    },
    {
      key: 'Sarajevo',
      value: i18n.t('(GMT+01:00) Sarajevo'),
    },
    {
      key: 'Skopje',
      value: i18n.t('(GMT+01:00) Skopje'),
    },
    {
      key: 'Stockholm',
      value: i18n.t('(GMT+01:00) Stockholm'),
    },
    {
      key: 'Vienna',
      value: i18n.t('(GMT+01:00) Vienna'),
    },
    {
      key: 'Warsaw',
      value: i18n.t('(GMT+01:00) Warsaw'),
    },
    {
      key: 'West Central Africa',
      value: i18n.t('(GMT+01:00) West Central Africa'),
    },
    {
      key: 'Zagreb',
      value: i18n.t('(GMT+01:00) Zagreb'),
    },
    {
      key: 'Athens',
      value: i18n.t('(GMT+02:00) Athens'),
    },
    {
      key: 'Bucharest',
      value: i18n.t('(GMT+02:00) Bucharest'),
    },
    {
      key: 'Cairo',
      value: i18n.t('(GMT+02:00) Cairo'),
    },
    {
      key: 'Harare',
      value: i18n.t('(GMT+02:00) Harare'),
    },
    {
      key: 'Helsinki',
      value: i18n.t('(GMT+02:00) Helsinki'),
    },
    {
      key: 'Istanbul',
      value: i18n.t('(GMT+02:00) Istanbul'),
    },
    {
      key: 'Jerusalem',
      value: i18n.t('(GMT+02:00) Jerusalem'),
    },
    {
      key: 'Kaliningrad',
      value: i18n.t('(GMT+02:00) Kaliningrad'),
    },
    {
      key: 'Kyiv',
      value: i18n.t('(GMT+02:00) Kyiv'),
    },
    {
      key: 'Pretoria',
      value: i18n.t('(GMT+02:00) Pretoria'),
    },
    {
      key: 'Riga',
      value: i18n.t('(GMT+02:00) Riga'),
    },
    {
      key: 'Sofia',
      value: i18n.t('(GMT+02:00) Sofia'),
    },
    {
      key: 'Tallinn',
      value: i18n.t('(GMT+02:00) Tallinn'),
    },
    {
      key: 'Vilnius',
      value: i18n.t('(GMT+02:00) Vilnius'),
    },
    {
      key: 'Baghdad',
      value: i18n.t('(GMT+03:00) Baghdad'),
    },
    {
      key: 'Kuwait',
      value: i18n.t('(GMT+03:00) Kuwait'),
    },
    {
      key: 'Minsk',
      value: i18n.t('(GMT+03:00) Minsk'),
    },
    {
      key: 'Moscow',
      value: i18n.t('(GMT+03:00) Moscow'),
    },
    {
      key: 'Nairobi',
      value: i18n.t('(GMT+03:00) Nairobi'),
    },
    {
      key: 'Riyadh',
      value: i18n.t('(GMT+03:00) Riyadh'),
    },
    {
      key: 'St. Petersburg',
      value: i18n.t('(GMT+03:00) St. Petersburg'),
    },
    {
      key: 'Volgograd',
      value: i18n.t('(GMT+03:00) Volgograd'),
    },
    {
      key: 'Tehran',
      value: i18n.t('(GMT+03:30) Tehran'),
    },
    {
      key: 'Abu Dhabi',
      value: i18n.t('(GMT+04:00) Abu Dhabi'),
    },
    {
      key: 'Baku',
      value: i18n.t('(GMT+04:00) Baku'),
    },
    {
      key: 'Muscat',
      value: i18n.t('(GMT+04:00) Muscat'),
    },
    {
      key: 'Samara',
      value: i18n.t('(GMT+04:00) Samara'),
    },
    {
      key: 'Tbilisi',
      value: i18n.t('(GMT+04:00) Tbilisi'),
    },
    {
      key: 'Yerevan',
      value: i18n.t('(GMT+04:00) Yerevan'),
    },
    {
      key: 'Kabul',
      value: i18n.t('(GMT+04:30) Kabul'),
    },
    {
      key: 'Ekaterinburg',
      value: i18n.t('(GMT+05:00) Ekaterinburg'),
    },
    {
      key: 'Islamabad',
      value: i18n.t('(GMT+05:00) Islamabad'),
    },
    {
      key: 'Karachi',
      value: i18n.t('(GMT+05:00) Karachi'),
    },
    {
      key: 'Tashkent',
      value: i18n.t('(GMT+05:00) Tashkent'),
    },
    {
      key: 'Chennai',
      value: i18n.t('(GMT+05:30) Chennai'),
    },
    {
      key: 'Kolkata',
      value: i18n.t('(GMT+05:30) Kolkata'),
    },
    {
      key: 'Mumbai',
      value: i18n.t('(GMT+05:30) Mumbai'),
    },
    {
      key: 'New Delhi',
      value: i18n.t('(GMT+05:30) New Delhi'),
    },
    {
      key: 'Sri Jayawardenepura',
      value: i18n.t('(GMT+05:30) Sri Jayawardenepura'),
    },
    {
      key: 'Kathmandu',
      value: i18n.t('(GMT+05:45) Kathmandu'),
    },
    {
      key: 'Almaty',
      value: i18n.t('(GMT+06:00) Almaty'),
    },
    {
      key: 'Astana',
      value: i18n.t('(GMT+06:00) Astana'),
    },
    {
      key: 'Dhaka',
      value: i18n.t('(GMT+06:00) Dhaka'),
    },
    {
      key: 'Urumqi',
      value: i18n.t('(GMT+06:00) Urumqi'),
    },
    {
      key: 'Rangoon',
      value: i18n.t('(GMT+06:30) Rangoon'),
    },
    {
      key: 'Bangkok',
      value: i18n.t('(GMT+07:00) Bangkok'),
    },
    {
      key: 'Hanoi',
      value: i18n.t('(GMT+07:00) Hanoi'),
    },
    {
      key: 'Jakarta',
      value: i18n.t('(GMT+07:00) Jakarta'),
    },
    {
      key: 'Krasnoyarsk',
      value: i18n.t('(GMT+07:00) Krasnoyarsk'),
    },
    {
      key: 'Novosibirsk',
      value: i18n.t('(GMT+07:00) Novosibirsk'),
    },
    {
      key: 'Beijing',
      value: i18n.t('(GMT+08:00) Beijing'),
    },
    {
      key: 'Chongqing',
      value: i18n.t('(GMT+08:00) Chongqing'),
    },
    {
      key: 'Hong Kong',
      value: i18n.t('(GMT+08:00) Hong Kong'),
    },
    {
      key: 'Irkutsk',
      value: i18n.t('(GMT+08:00) Irkutsk'),
    },
    {
      key: 'Kuala Lumpur',
      value: i18n.t('(GMT+08:00) Kuala Lumpur'),
    },
    {
      key: 'Perth',
      value: i18n.t('(GMT+08:00) Perth'),
    },
    {
      key: 'Singapore',
      value: i18n.t('(GMT+08:00) Singapore'),
    },
    {
      key: 'Taipei',
      value: i18n.t('(GMT+08:00) Taipei'),
    },
    {
      key: 'Ulaanbaatar',
      value: i18n.t('(GMT+08:00) Ulaanbaatar'),
    },
    {
      key: 'Osaka',
      value: i18n.t('(GMT+09:00) Osaka'),
    },
    {
      key: 'Sapporo',
      value: i18n.t('(GMT+09:00) Sapporo'),
    },
    {
      key: 'Seoul',
      value: i18n.t('(GMT+09:00) Seoul'),
    },
    {
      key: 'Tokyo',
      value: i18n.t('(GMT+09:00) Tokyo'),
    },
    {
      key: 'Yakutsk',
      value: i18n.t('(GMT+09:00) Yakutsk'),
    },
    {
      key: 'Adelaide',
      value: i18n.t('(GMT+09:30) Adelaide'),
    },
    {
      key: 'Darwin',
      value: i18n.t('(GMT+09:30) Darwin'),
    },
    {
      key: 'Brisbane',
      value: i18n.t('(GMT+10:00) Brisbane'),
    },
    {
      key: 'Canberra',
      value: i18n.t('(GMT+10:00) Canberra'),
    },
    {
      key: 'Guam',
      value: i18n.t('(GMT+10:00) Guam'),
    },
    {
      key: 'Hobart',
      value: i18n.t('(GMT+10:00) Hobart'),
    },
    {
      key: 'Melbourne',
      value: i18n.t('(GMT+10:00) Melbourne'),
    },
    {
      key: 'Port Moresby',
      value: i18n.t('(GMT+10:00) Port Moresby'),
    },
    {
      key: 'Sydney',
      value: i18n.t('(GMT+10:00) Sydney'),
    },
    {
      key: 'Vladivostok',
      value: i18n.t('(GMT+10:00) Vladivostok'),
    },
    {
      key: 'Magadan',
      value: i18n.t('(GMT+11:00) Magadan'),
    },
    {
      key: 'New Caledonia',
      value: i18n.t('(GMT+11:00) New Caledonia'),
    },
    {
      key: 'Solomon Is.',
      value: i18n.t('(GMT+11:00) Solomon Is.'),
    },
    {
      key: 'Srednekolymsk',
      value: i18n.t('(GMT+11:00) Srednekolymsk'),
    },
    {
      key: 'Auckland',
      value: i18n.t('(GMT+12:00) Auckland'),
    },
    {
      key: 'Fiji',
      value: i18n.t('(GMT+12:00) Fiji'),
    },
    {
      key: 'Kamchatka',
      value: i18n.t('(GMT+12:00) Kamchatka'),
    },
    {
      key: 'Marshall Is.',
      value: i18n.t('(GMT+12:00) Marshall Is.'),
    },
    {
      key: 'Wellington',
      value: i18n.t('(GMT+12:00) Wellington'),
    },
    {
      key: 'Chatham Is.',
      value: i18n.t('(GMT+12:45) Chatham Is.'),
    },
    {
      key: "Nuku'alofa",
      value: i18n.t("(GMT+13:00) Nuku'alofa"),
    },
    {
      key: 'Tokelau Is.',
      value: i18n.t('(GMT+13:00) Tokelau Is.'),
    },
  ];
  return timezones;
};
