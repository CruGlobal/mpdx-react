import { useTranslation } from 'react-i18next';

export const useGetTimezones = (): Array<Record<string, string>> => {
  const { t } = useTranslation();
  const timezones = [
    {
      key: 'American Samoa',
      value: t('(GMT-11:00) American Samoa'),
    },
    {
      key: 'International Date Line West',
      value: t('(GMT-11:00) International Date Line West'),
    },
    {
      key: 'Midway Island',
      value: t('(GMT-11:00) Midway Island'),
    },
    {
      key: 'Samoa',
      value: t('(GMT-11:00) Samoa'),
    },
    {
      key: 'Hawaii',
      value: t('(GMT-10:00) Hawaii'),
    },
    {
      key: 'Alaska',
      value: t('(GMT-09:00) Alaska'),
    },
    {
      key: 'Pacific Time (US & Canada)',
      value: t('(GMT-08:00) Pacific Time (US & Canada)'),
    },
    {
      key: 'Tijuana',
      value: t('(GMT-08:00) Tijuana'),
    },
    {
      key: 'Arizona',
      value: t('(GMT-07:00) Arizona'),
    },
    {
      key: 'Chihuahua',
      value: t('(GMT-07:00) Chihuahua'),
    },
    {
      key: 'Mazatlan',
      value: t('(GMT-07:00) Mazatlan'),
    },
    {
      key: 'Mountain Time (US & Canada)',
      value: t('(GMT-07:00) Mountain Time (US & Canada)'),
    },
    {
      key: 'Central America',
      value: t('(GMT-06:00) Central America'),
    },
    {
      key: 'Central Time (US & Canada)',
      value: t('(GMT-06:00) Central Time (US & Canada)'),
    },
    {
      key: 'Guadalajara',
      value: t('(GMT-06:00) Guadalajara'),
    },
    {
      key: 'Mexico City',
      value: t('(GMT-06:00) Mexico City'),
    },
    {
      key: 'Monterrey',
      value: t('(GMT-06:00) Monterrey'),
    },
    {
      key: 'Saskatchewan',
      value: t('(GMT-06:00) Saskatchewan'),
    },
    {
      key: 'Bogota',
      value: t('(GMT-05:00) Bogota'),
    },
    {
      key: 'Eastern Time (US & Canada)',
      value: t('(GMT-05:00) Eastern Time (US & Canada)'),
    },
    {
      key: 'Indiana (East)',
      value: t('(GMT-05:00) Indiana (East)'),
    },
    {
      key: 'Lima',
      value: t('(GMT-05:00) Lima'),
    },
    {
      key: 'Quito',
      value: t('(GMT-05:00) Quito'),
    },
    {
      key: 'Atlantic Time (Canada)',
      value: t('(GMT-04:00) Atlantic Time (Canada)'),
    },
    {
      key: 'Caracas',
      value: t('(GMT-04:00) Caracas'),
    },
    {
      key: 'Georgetown',
      value: t('(GMT-04:00) Georgetown'),
    },
    {
      key: 'La Paz',
      value: t('(GMT-04:00) La Paz'),
    },
    {
      key: 'Santiago',
      value: t('(GMT-04:00) Santiago'),
    },
    {
      key: 'Newfoundland',
      value: t('(GMT-03:30) Newfoundland'),
    },
    {
      key: 'Brasilia',
      value: t('(GMT-03:00) Brasilia'),
    },
    {
      key: 'Buenos Aires',
      value: t('(GMT-03:00) Buenos Aires'),
    },
    {
      key: 'Greenland',
      value: t('(GMT-03:00) Greenland'),
    },
    {
      key: 'Montevideo',
      value: t('(GMT-03:00) Montevideo'),
    },
    {
      key: 'Mid-Atlantic',
      value: t('(GMT-02:00) Mid-Atlantic'),
    },
    {
      key: 'Azores',
      value: t('(GMT-01:00) Azores'),
    },
    {
      key: 'Cape Verde Is.',
      value: t('(GMT-01:00) Cape Verde Is.'),
    },
    {
      key: 'Casablanca',
      value: t('(GMT+00:00) Casablanca'),
    },
    {
      key: 'Dublin',
      value: t('(GMT+00:00) Dublin'),
    },
    {
      key: 'Edinburgh',
      value: t('(GMT+00:00) Edinburgh'),
    },
    {
      key: 'Lisbon',
      value: t('(GMT+00:00) Lisbon'),
    },
    {
      key: 'London',
      value: t('(GMT+00:00) London'),
    },
    {
      key: 'Monrovia',
      value: t('(GMT+00:00) Monrovia'),
    },
    {
      key: 'UTC',
      value: t('(GMT+00:00) UTC'),
    },
    {
      key: 'Amsterdam',
      value: t('(GMT+01:00) Amsterdam'),
    },
    {
      key: 'Belgrade',
      value: t('(GMT+01:00) Belgrade'),
    },
    {
      key: 'Berlin',
      value: t('(GMT+01:00) Berlin'),
    },
    {
      key: 'Bern',
      value: t('(GMT+01:00) Bern'),
    },
    {
      key: 'Bratislava',
      value: t('(GMT+01:00) Bratislava'),
    },
    {
      key: 'Brussels',
      value: t('(GMT+01:00) Brussels'),
    },
    {
      key: 'Budapest',
      value: t('(GMT+01:00) Budapest'),
    },
    {
      key: 'Copenhagen',
      value: t('(GMT+01:00) Copenhagen'),
    },
    {
      key: 'Ljubljana',
      value: t('(GMT+01:00) Ljubljana'),
    },
    {
      key: 'Madrid',
      value: t('(GMT+01:00) Madrid'),
    },
    {
      key: 'Paris',
      value: t('(GMT+01:00) Paris'),
    },
    {
      key: 'Prague',
      value: t('(GMT+01:00) Prague'),
    },
    {
      key: 'Rome',
      value: t('(GMT+01:00) Rome'),
    },
    {
      key: 'Sarajevo',
      value: t('(GMT+01:00) Sarajevo'),
    },
    {
      key: 'Skopje',
      value: t('(GMT+01:00) Skopje'),
    },
    {
      key: 'Stockholm',
      value: t('(GMT+01:00) Stockholm'),
    },
    {
      key: 'Vienna',
      value: t('(GMT+01:00) Vienna'),
    },
    {
      key: 'Warsaw',
      value: t('(GMT+01:00) Warsaw'),
    },
    {
      key: 'West Central Africa',
      value: t('(GMT+01:00) West Central Africa'),
    },
    {
      key: 'Zagreb',
      value: t('(GMT+01:00) Zagreb'),
    },
    {
      key: 'Athens',
      value: t('(GMT+02:00) Athens'),
    },
    {
      key: 'Bucharest',
      value: t('(GMT+02:00) Bucharest'),
    },
    {
      key: 'Cairo',
      value: t('(GMT+02:00) Cairo'),
    },
    {
      key: 'Harare',
      value: t('(GMT+02:00) Harare'),
    },
    {
      key: 'Helsinki',
      value: t('(GMT+02:00) Helsinki'),
    },
    {
      key: 'Istanbul',
      value: t('(GMT+02:00) Istanbul'),
    },
    {
      key: 'Jerusalem',
      value: t('(GMT+02:00) Jerusalem'),
    },
    {
      key: 'Kaliningrad',
      value: t('(GMT+02:00) Kaliningrad'),
    },
    {
      key: 'Kyiv',
      value: t('(GMT+02:00) Kyiv'),
    },
    {
      key: 'Pretoria',
      value: t('(GMT+02:00) Pretoria'),
    },
    {
      key: 'Riga',
      value: t('(GMT+02:00) Riga'),
    },
    {
      key: 'Sofia',
      value: t('(GMT+02:00) Sofia'),
    },
    {
      key: 'Tallinn',
      value: t('(GMT+02:00) Tallinn'),
    },
    {
      key: 'Vilnius',
      value: t('(GMT+02:00) Vilnius'),
    },
    {
      key: 'Baghdad',
      value: t('(GMT+03:00) Baghdad'),
    },
    {
      key: 'Kuwait',
      value: t('(GMT+03:00) Kuwait'),
    },
    {
      key: 'Minsk',
      value: t('(GMT+03:00) Minsk'),
    },
    {
      key: 'Moscow',
      value: t('(GMT+03:00) Moscow'),
    },
    {
      key: 'Nairobi',
      value: t('(GMT+03:00) Nairobi'),
    },
    {
      key: 'Riyadh',
      value: t('(GMT+03:00) Riyadh'),
    },
    {
      key: 'St. Petersburg',
      value: t('(GMT+03:00) St. Petersburg'),
    },
    {
      key: 'Volgograd',
      value: t('(GMT+03:00) Volgograd'),
    },
    {
      key: 'Tehran',
      value: t('(GMT+03:30) Tehran'),
    },
    {
      key: 'Abu Dhabi',
      value: t('(GMT+04:00) Abu Dhabi'),
    },
    {
      key: 'Baku',
      value: t('(GMT+04:00) Baku'),
    },
    {
      key: 'Muscat',
      value: t('(GMT+04:00) Muscat'),
    },
    {
      key: 'Samara',
      value: t('(GMT+04:00) Samara'),
    },
    {
      key: 'Tbilisi',
      value: t('(GMT+04:00) Tbilisi'),
    },
    {
      key: 'Yerevan',
      value: t('(GMT+04:00) Yerevan'),
    },
    {
      key: 'Kabul',
      value: t('(GMT+04:30) Kabul'),
    },
    {
      key: 'Ekaterinburg',
      value: t('(GMT+05:00) Ekaterinburg'),
    },
    {
      key: 'Islamabad',
      value: t('(GMT+05:00) Islamabad'),
    },
    {
      key: 'Karachi',
      value: t('(GMT+05:00) Karachi'),
    },
    {
      key: 'Tashkent',
      value: t('(GMT+05:00) Tashkent'),
    },
    {
      key: 'Chennai',
      value: t('(GMT+05:30) Chennai'),
    },
    {
      key: 'Kolkata',
      value: t('(GMT+05:30) Kolkata'),
    },
    {
      key: 'Mumbai',
      value: t('(GMT+05:30) Mumbai'),
    },
    {
      key: 'New Delhi',
      value: t('(GMT+05:30) New Delhi'),
    },
    {
      key: 'Sri Jayawardenepura',
      value: t('(GMT+05:30) Sri Jayawardenepura'),
    },
    {
      key: 'Kathmandu',
      value: t('(GMT+05:45) Kathmandu'),
    },
    {
      key: 'Almaty',
      value: t('(GMT+06:00) Almaty'),
    },
    {
      key: 'Astana',
      value: t('(GMT+06:00) Astana'),
    },
    {
      key: 'Dhaka',
      value: t('(GMT+06:00) Dhaka'),
    },
    {
      key: 'Urumqi',
      value: t('(GMT+06:00) Urumqi'),
    },
    {
      key: 'Rangoon',
      value: t('(GMT+06:30) Rangoon'),
    },
    {
      key: 'Bangkok',
      value: t('(GMT+07:00) Bangkok'),
    },
    {
      key: 'Hanoi',
      value: t('(GMT+07:00) Hanoi'),
    },
    {
      key: 'Jakarta',
      value: t('(GMT+07:00) Jakarta'),
    },
    {
      key: 'Krasnoyarsk',
      value: t('(GMT+07:00) Krasnoyarsk'),
    },
    {
      key: 'Novosibirsk',
      value: t('(GMT+07:00) Novosibirsk'),
    },
    {
      key: 'Beijing',
      value: t('(GMT+08:00) Beijing'),
    },
    {
      key: 'Chongqing',
      value: t('(GMT+08:00) Chongqing'),
    },
    {
      key: 'Hong Kong',
      value: t('(GMT+08:00) Hong Kong'),
    },
    {
      key: 'Irkutsk',
      value: t('(GMT+08:00) Irkutsk'),
    },
    {
      key: 'Kuala Lumpur',
      value: t('(GMT+08:00) Kuala Lumpur'),
    },
    {
      key: 'Perth',
      value: t('(GMT+08:00) Perth'),
    },
    {
      key: 'Singapore',
      value: t('(GMT+08:00) Singapore'),
    },
    {
      key: 'Taipei',
      value: t('(GMT+08:00) Taipei'),
    },
    {
      key: 'Ulaanbaatar',
      value: t('(GMT+08:00) Ulaanbaatar'),
    },
    {
      key: 'Osaka',
      value: t('(GMT+09:00) Osaka'),
    },
    {
      key: 'Sapporo',
      value: t('(GMT+09:00) Sapporo'),
    },
    {
      key: 'Seoul',
      value: t('(GMT+09:00) Seoul'),
    },
    {
      key: 'Tokyo',
      value: t('(GMT+09:00) Tokyo'),
    },
    {
      key: 'Yakutsk',
      value: t('(GMT+09:00) Yakutsk'),
    },
    {
      key: 'Adelaide',
      value: t('(GMT+09:30) Adelaide'),
    },
    {
      key: 'Darwin',
      value: t('(GMT+09:30) Darwin'),
    },
    {
      key: 'Brisbane',
      value: t('(GMT+10:00) Brisbane'),
    },
    {
      key: 'Canberra',
      value: t('(GMT+10:00) Canberra'),
    },
    {
      key: 'Guam',
      value: t('(GMT+10:00) Guam'),
    },
    {
      key: 'Hobart',
      value: t('(GMT+10:00) Hobart'),
    },
    {
      key: 'Melbourne',
      value: t('(GMT+10:00) Melbourne'),
    },
    {
      key: 'Port Moresby',
      value: t('(GMT+10:00) Port Moresby'),
    },
    {
      key: 'Sydney',
      value: t('(GMT+10:00) Sydney'),
    },
    {
      key: 'Vladivostok',
      value: t('(GMT+10:00) Vladivostok'),
    },
    {
      key: 'Magadan',
      value: t('(GMT+11:00) Magadan'),
    },
    {
      key: 'New Caledonia',
      value: t('(GMT+11:00) New Caledonia'),
    },
    {
      key: 'Solomon Is.',
      value: t('(GMT+11:00) Solomon Is.'),
    },
    {
      key: 'Srednekolymsk',
      value: t('(GMT+11:00) Srednekolymsk'),
    },
    {
      key: 'Auckland',
      value: t('(GMT+12:00) Auckland'),
    },
    {
      key: 'Fiji',
      value: t('(GMT+12:00) Fiji'),
    },
    {
      key: 'Kamchatka',
      value: t('(GMT+12:00) Kamchatka'),
    },
    {
      key: 'Marshall Is.',
      value: t('(GMT+12:00) Marshall Is.'),
    },
    {
      key: 'Wellington',
      value: t('(GMT+12:00) Wellington'),
    },
    {
      key: 'Chatham Is.',
      value: t('(GMT+12:45) Chatham Is.'),
    },
    {
      key: "Nuku'alofa",
      value: t("(GMT+13:00) Nuku'alofa"),
    },
    {
      key: 'Tokelau Is.',
      value: t('(GMT+13:00) Tokelau Is.'),
    },
  ];
  return timezones;
};
