// could be more types
export enum DonationType {
  EFT = 'EFT',
  CreditCard = 'Credit Card',
  Wire = 'Wire',
  Check = 'Check',
}

export interface TableData {
  id: string;
  name: string;
  date: string;
  type: DonationType;
  amount: number;
}

export const mockData: TableData[] = [
  {
    id: '783283434',
    name: 'David Walker',
    date: '2023-01-15',
    type: DonationType.CreditCard,
    amount: 150,
  },
  {
    id: '795640274',
    name: 'Vicki Scott',
    date: '2023-02-20',
    type: DonationType.EFT,
    amount: 50,
  },
  {
    id: '123456789',
    name: 'John Doe',
    date: '2023-03-10',
    type: DonationType.Wire,
    amount: 200,
  },
  {
    id: '987654321',
    name: 'Jane Smith',
    date: '2023-04-05',
    type: DonationType.Check,
    amount: 75,
  },
  {
    id: '456789123',
    name: 'Michael Johnson',
    date: '2023-05-18',
    type: DonationType.CreditCard,
    amount: 120,
  },
  {
    id: '321654987',
    name: 'Emily Davis',
    date: '2023-06-22',
    type: DonationType.EFT,
    amount: 90,
  },
  {
    id: '654987321',
    name: 'Chris Brown',
    date: '2023-07-30',
    type: DonationType.Wire,
    amount: 300,
  },
  {
    id: '789123456',
    name: 'Sarah Wilson',
    date: '2023-08-14',
    type: DonationType.Check,
    amount: 60,
  },
  {
    id: '852963741',
    name: 'David Lee',
    date: '2023-09-12',
    type: DonationType.CreditCard,
    amount: 180,
  },
  {
    id: '741258369',
    name: 'Olivia Martinez',
    date: '2023-10-08',
    type: DonationType.EFT,
    amount: 110,
  },
  {
    id: '963852741',
    name: 'James Anderson',
    date: '2023-11-03',
    type: DonationType.Wire,
    amount: 250,
  },
  {
    id: '159753486',
    name: 'Isabella Taylor',
    date: '2023-12-19',
    type: DonationType.Check,
    amount: 80,
  },
  {
    id: '357159486',
    name: 'William Thomas',
    date: '2023-01-27',
    type: DonationType.CreditCard,
    amount: 140,
  },
  {
    id: '258456369',
    name: 'Mia Harris',
    date: '2023-02-15',
    type: DonationType.EFT,
    amount: 95,
  },
  {
    id: '654123987',
    name: 'Benjamin Clark',
    date: '2023-03-22',
    type: DonationType.Wire,
    amount: 220,
  },
  {
    id: '321789654',
    name: 'Sophia Rodriguez',
    date: '2023-04-11',
    type: DonationType.Check,
    amount: 70,
  },
  {
    id: '987321654',
    name: 'Lucas Lewis',
    date: '2023-05-29',
    type: DonationType.CreditCard,
    amount: 130,
  },
  {
    id: '159486753',
    name: 'Amelia Walker',
    date: '2023-06-17',
    type: DonationType.EFT,
    amount: 85,
  },
];
