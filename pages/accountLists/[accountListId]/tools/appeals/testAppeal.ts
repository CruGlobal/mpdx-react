// Structure is not correct but it should not be hard to convert either this to the proper one or the actual response to this format

export interface TestContactDonation {
  name: string;
  amount: number;
  currency: string;
  date: string;
}

export interface TestContact {
  name: string;
  regularGiving: number;
  currency: string;
  frequency?: string;
  reason?: string[];
}

export interface TestAppeal {
  name: string;
  goal: number;
  currency: string;
  givenTotal: number;
  receivedTotal: number;
  committedTotal: number;
  given: TestContactDonation[];
  received: TestContactDonation[];
  committed: TestContactDonation[];
  asked: TestContact[];
  excluded: TestContact[];
}

export const testAppeal: TestAppeal = {
  name: 'Test Appeal',
  goal: 3613.34,
  currency: 'CAD',
  givenTotal: 0,
  receivedTotal: 500,
  committedTotal: 0,
  given: [],
  received: [],
  committed: [],
  asked: [],
  excluded: [],
};

export const testAppeal2: TestAppeal = {
  name: 'Test Appeal 2',
  goal: 4234,
  currency: 'CAD',
  givenTotal: 65.55,
  receivedTotal: 396,
  committedTotal: 1000,
  given: [
    {
      name: 'CCCCC',
      amount: 65.55,
      currency: 'CAD',
      date: '08/22/2021',
    },
  ],
  received: [
    {
      name: 'Chris',
      amount: 999.99,
      currency: 'CAD',
      date: '08/22/2021',
    },
    {
      name: 'Test 123',
      amount: 500,
      currency: 'CAD',
      date: '06/14/2021',
    },
    {
      name: 'asdasdsad',
      amount: 501.1111,
      currency: 'CAD',
      date: '06/14/2021',
    },
    {
      name: 'vvvv',
      amount: 5000,
      currency: 'CAD',
      date: '06/22/2020',
    },
    {
      name: 'true',
      amount: 5.34,
      currency: 'CAD',
      date: '02/14/1999',
    },
  ],
  committed: [
    {
      name: 'AAABBB',
      amount: 1000,
      currency: 'CAD',
      date: '01/01/1951',
    },
  ],
  asked: [
    {
      name: '63486328423a',
      regularGiving: 50,
      currency: 'CAD',
      frequency: 'Annualy',
    },
    {
      name: 'Aaaaa4',
      regularGiving: 0,
      currency: 'CAD',
    },
    {
      name: 'Aaaaa5',
      regularGiving: 0,
      currency: 'CAD',
    },
    {
      name: 'Aaaaa6',
      regularGiving: 1000,
      currency: 'CAD',
      frequency: 'Quarterly',
    },
  ],
  excluded: [
    {
      name: 'Aaaaa1',
      regularGiving: 0,
      currency: 'CAD',
      reason: ['"Send Appeals" set to No'],
    },
    {
      name: 'Aaaaa2',
      regularGiving: 0,
      currency: 'USD',
      reason: ['"Send Appeals" set to No'],
    },
    {
      name: 'Aaaaa3',
      regularGiving: 50,
      currency: 'CAD',
      frequency: 'Monthly',
      reason: [
        '"Send Appeals" set to No',
        'May have increased their giving in the last 3 months',
      ],
    },
  ],
};
