export interface DataFields {
  id: string;
  description: string;
  monthly: number[];
  average: number;
  total: number;
}

export interface AllData {
  income: DataFields[];
  expenses: DataFields[];
}

export const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

export const mockData: AllData = {
  income: [
    {
      id: crypto.randomUUID(),
      description: 'Contributions',
      monthly: [
        6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
        19215,
      ],
      average: 9013,
      total: 108156,
    },
    {
      id: crypto.randomUUID(),
      description: 'Fr Andre, Fre to Mouna Ghar',
      monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
      average: 58,
      total: 700,
    },
    {
      id: crypto.randomUUID(),
      description: 'All zeros test',
      monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 0,
      total: 0,
    },
  ],
  expenses: [
    {
      id: crypto.randomUUID(),
      description: 'Supplies and Materials',
      monthly: [0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 17,
      total: 200,
    },
    {
      id: crypto.randomUUID(),
      description: 'Business Auto Mileage',
      monthly: [0, 0, 0, 0, 0, 0, 565, 0, 488, 253, 818, 0],
      average: 177,
      total: 2124,
    },
    {
      id: crypto.randomUUID(),
      description: 'Single/Husband/Widow EOBs',
      monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
      average: 161,
      total: 1933,
    },
    {
      id: crypto.randomUUID(),
      description: 'AUGUST 2024',
      monthly: [26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 2,
      total: 26,
    },
    {
      id: crypto.randomUUID(),
      description: 'Charge(s) for Credit Card gift(s)',
      monthly: [23, 23, 23, 45, 22, 22, 28, 24, 28, 29, 186, 55],
      average: 42,
      total: 507,
    },
    {
      id: crypto.randomUUID(),
      description: 'Staff Assessment',
      monthly: [812, 731, 692, 883, 964, 789, 907, 989, 1176, 1227, 2237, 2372],
      average: 1148,
      total: 13779,
    },
  ],
};
