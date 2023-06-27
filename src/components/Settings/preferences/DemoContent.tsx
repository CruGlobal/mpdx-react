export const profile = {
  id: '1',
  alma_mater: 'Sac State',
  anniversary_day: 18,
  anniversary_month: 10,
  anniversary_year: 1928,
  avatar:
    'https://lumiere-a.akamaihd.net/v1/images/ct_mickeymouseandfriends_mickey_ddt-16970_4e99445d.jpeg?region=0,0,600,600&width=480',
  birthday_day: 7,
  birthday_month: 10,
  birthday_year: 1983,
  email: [
    {
      value: 'personal@test.com',
      type: 'personal',
      primary: false,
      invalid: true,
    },
    {
      value: 'work@test.com',
      type: 'work',
      primary: true,
      invalid: false,
    },
  ],
  employer: 'Disney',
  facebook_accounts: ['CruGlobal', 'jplastow2'],
  family_relationships: [
    {
      name: 'Minnie',
      relation: 'Wife',
    },
    {
      name: 'Goofy',
      relation: 'Brother',
    },
  ],
  first_name: 'Mickey',
  gender: 'male',
  last_name: 'Mouse',
  legal_first_name: 'Michaelangelo',
  linkedin_accounts: ['https://www.linkedin.com/company/cru-global/'],
  marital_status: 'Married',
  middle_name: '',
  occupation: 'Head Mouse',
  parent_contacts: null,
  phone: [
    {
      value: '1234567890',
      type: 'home',
      primary: false,
      invalid: false,
    },
    {
      value: '0987654321',
      type: 'mobile',
      primary: true,
      invalid: false,
    },
  ],
  preferences: null,
  suffix: 'Sr.',
  title: 'Mr.',
  twitter_accounts: ['CruTweets'],
  websites: ['https://cru.org'],
};

export const profile2 = {
  emailAddresses: {
    nodes: [
      {
        email: 'test1234@test.com',
        primary: true,
        historic: false,
        location: 'Work',
        source: 'MPDX',
      },
      {
        email: 'secondemail@test.com',
        location: 'Personal',
        primary: false,
        historic: false,
        source: 'MPDX',
      },
    ],
  },
  phoneNumbers: {
    nodes: [
      {
        number: '777-777-7777',
        location: 'Mobile',
        primary: true,
        historic: false,
        source: 'MPDX',
      },
      {
        number: '999-999-9999',
        location: 'Work',
        primary: false,
        historic: false,
        source: 'MPDX',
      },
    ],
  },
  facebookAccounts: {
    nodes: [
      {
        username: 'test guy',
      },
      {
        username: 'test guy 2',
      },
    ],
  },
  twitterAccounts: {
    nodes: [
      {
        screenName: '@testguy',
      },
      {
        screenName: '@testguy2',
      },
    ],
  },
  linkedinAccounts: {
    nodes: [
      {
        publicUrl: 'Test Guy',
      },
      {
        publicUrl: 'Test Guy 2',
      },
    ],
  },
  websites: {
    nodes: [
      {
        url: 'testguy.com',
      },
      {
        url: 'testguy2.com',
      },
    ],
  },
  optoutEnewsletter: false,
  anniversaryDay: 1,
  anniversaryMonth: 1,
  anniversaryYear: 1990,
  birthdayDay: 1,
  birthdayMonth: 1,
  birthdayYear: 1990,
  maritalStatus: 'Engaged',
  gender: 'Male',
  deceased: false,
  id: '01',
  firstName: 'Jack',
  lastName: 'Sparrow',
  title: 'Mr.',
  suffix: '',
};

export const language = [
  ['en-US', 'US English'],
  ['ar', 'Arabic (العربية)'],
  ['hy', 'Armenian'],
  ['my', 'Myanmar Language'],
  ['zh-Hans', 'Simplified Chinese (简体中文)'],
  ['nl', 'Dutch (Nederlands)'],
  ['fr-ca', 'Canadian French (français canadien)'],
  ['fr', 'French (français)'],
  ['de', 'German (Deutsch)'],
  ['gsw', 'Swiss High German (Schweizer Hochdeutsch)'],
  ['id', 'Indonesian (Indonesia)'],
  ['it', 'Italian (italiano)'],
  ['ko', 'Korean (한국어)'],
  ['pl', 'Polish (polski)'],
  ['pt-br', 'Brazilian Portuguese (português do Brasil)'],
  ['ru', 'Russian (русский)'],
  ['es-419', 'Latin American Spanish (español latinoamericano)'],
  ['th', 'Thai (ไทย)'],
  ['tr', 'Turkish (Türkçe)'],
  ['uk', 'Ukrainian (українська)'],
  ['vi', 'Vietnamese (Tiếng Việt)'],
];

export const localeOptions = [
  ['af', 'Afrikaans (af) (Afrikaans - af)'],
  ['sq', 'Albanian (sq) (shqip - sq)'],
  ['ar', 'Arabic (ar) (العربية - ar)'],
  ['en-AU', 'Australian English (en-AU) (Australian English - en-au)'],
  ['eu', 'Basque (eu) (euskara - eu)'],
  ['be', 'Belarusian (be) (беларуская - be)'],
  ['bn', 'Bengali (bn) (বাংলা - bn)'],
  ['bg', 'Bulgarian (bg) (български - bg)'],
  ['en-CA', 'Canadian English (en-CA) (Canadian English - en-ca)'],
  ['fr-CA', 'Canadian French (fr-CA) (français canadien - fr-ca)'],
  ['ca', 'Catalan (ca) (català - ca)'],
  ['zh', 'Chinese (zh) (中文 - zh)'],
  ['hr', 'Croatian (hr) (hrvatski - hr)'],
  ['cs', 'Czech (cs) (čeština - cs)'],
  ['da', 'Danish (da) (dansk - da)'],
  ['nl', 'Dutch (nl) (Nederlands - nl)'],
  ['en', 'English (en) (English - en)'],
  ['fil', 'Filipino (fil) (Filipino - fil)'],
  ['fi', 'Finnish (fi) (suomi - fi)'],
  ['fr', 'French (fr) (français - fr)'],
  ['gl', 'Galician (gl) (galego - gl)'],
  ['de', 'German (de) (Deutsch - de)'],
  ['el', 'Greek (el) (Ελληνικά - el)'],
  ['gu', 'Gujarati (gu) (ગુજરાતી - gu)'],
  ['he', 'Hebrew (he) (עברית - he)'],
  ['hi', 'Hindi (hi) (हिन्दी - hi)'],
  ['hu', 'Hungarian (hu) (magyar - hu)'],
  ['is', 'Icelandic (is) (íslenska - is)'],
  ['id', 'Indonesian (id) (Indonesia - id)'],
  ['ga', 'Irish (ga) (Gaeilge - ga)'],
  ['it', 'Italian (it) (italiano - it)'],
  ['ja', 'Japanese (ja) (日本語 - ja)'],
  ['kn', 'Kannada (kn) (ಕನ್ನಡ - kn)'],
  ['ko', 'Korean (ko) (한국어 - ko)'],
  [
    'es-419',
    'Latin American Spanish (es-419) (español latinoamericano - es-419)',
  ],
  ['lv', 'Latvian (lv) (latviešu - lv)'],
  ['ms', 'Malay (ms) (Bahasa Melayu - ms)'],
  ['mr', 'Marathi (mr) (मराठी - mr)'],
  ['es-MX', 'Mexican Spanish (es-MX) (español de México - es-mx)'],
  ['nb', 'Norwegian Bokmål (nb) (norsk bokmål - nb)'],
  ['fa', 'Persian (fa) (فارسی - fa)'],
  ['pl', 'Polish (pl) (polski - pl)'],
  ['pt', 'Portuguese (pt) (português - pt)'],
  ['ro', 'Romanian (ro) (română - ro)'],
  ['ru', 'Russian (ru) (русский - ru)'],
  ['sr', 'Serbian (sr) (српски - sr)'],
  ['sk', 'Slovak (sk) (slovenčina - sk)'],
  ['sl', 'Slovenian (sl) (slovenščina - sl)'],
  ['es', 'Spanish (es) (español - es)'],
  ['sv', 'Swedish (sv) (svenska - sv)'],
  ['fr-CH', 'Swiss French (fr-CH) (français suisse - fr-ch)'],
  ['de-CH', 'Swiss High German (de-CH) (Schweizer Hochdeutsch - de-ch)'],
  ['ta', 'Tamil (ta) (தமிழ் - ta)'],
  ['th', 'Thai (th) (ไทย - th)'],
  ['bo', 'Tibetan (bo) (བོད་སྐད་ - bo)'],
  ['zh-Hant', 'Traditional Chinese (zh-Hant) (繁體中文 - zh-hant)'],
  ['tr', 'Turkish (tr) (Türkçe - tr)'],
  ['en-GB', 'UK English (en-GB) (UK English - en-gb)'],
  ['uk', 'Ukrainian (uk) (українська - uk)'],
  ['ur', 'Urdu (ur) (اردو - ur)'],
  ['vi', 'Vietnamese (vi) (Tiếng Việt - vi)'],
  ['cy', 'Welsh (cy) (Cymraeg - cy)'],
];

export const options = [
  ['opt1', 'Option 1'],
  ['opt2', 'Option 2'],
  ['opt3', 'Option 3'],
  ['opt4', 'Option 4'],
  ['opt5', 'Option 5'],
];

export const options2 = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
  { label: 'Option 4', value: 'opt4' },
  { label: 'Option 5', value: 'opt5' },
];
