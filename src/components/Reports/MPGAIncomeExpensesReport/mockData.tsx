interface DataFields {
  description: string;
  monthly: number[];
  average: number;
  total: number;
}

interface TableData {
  data: DataFields[];
  months: string[];
}

interface MockData {
  accountListId: string;
  accountName: string;
  income: TableData;
  ministryExpenses: TableData;
  healthcareExpenses: TableData;
  misc: TableData;
  other: TableData;
}

export const mockData: MockData = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: {
    data: [
      {
        description: 'Contributions',
        monthly: [
          6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
          19215,
        ],
        average: 9013,
        total: 108156,
      },
      {
        description: 'Fr Andre, Fre to Mouna Ghar',
        monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        average: 58,
        total: 700,
      },
      {
        description: 'Fr Hagen, Tan to Mouna Ghar',
        monthly: [150, 150, 150, 150, 150, 150, 150, 0, 0, 0, 0, 0],
        average: 88,
        total: 1050,
      },
      {
        description: 'Fr Smith, Har to Mouna Ghar',
        monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        average: 58,
        total: 700,
      },
      {
        description: 'Keep up the good work!',
        monthly: [0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0],
        average: 42,
        total: 500,
      },
      {
        description: 'rtrav to prime',
        monthly: [0, 0, 0, 0, 0, 0, 3500, 0, 0, 0, 0, 0],
        average: 292,
        total: 3500,
      },
      {
        description: 'Designation was updated fr',
        monthly: [0, 0, 0, 0, 0, 0, 0, 250, 500, 500, 500, 500],
        average: 188,
        total: 2250,
      },
      {
        description: '6035383-Salam Barbary funds',
        monthly: [0, 0, 0, 0, 0, 0, 0, 20086, 0, 0, 0, 0],
        average: 1674,
        total: 20086,
      },
      {
        description: 'Transfer fr Barbary',
        monthly: [0, 0, 0, 0, 0, 0, 0, 7573, 0, 0, 0, 0],
        average: 631,
        total: 7573,
      },
      {
        description: '6105835-Makkar to Barbary',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0],
        average: 8,
        total: 100,
      },
      {
        description: '6108363-Dons from Iraqi don',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 1420, 0, 0, 0],
        average: 118,
        total: 1420,
      },
      {
        description: 'Fr Gamal and to Salam and',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100],
        average: 33,
        total: 400,
      },
      {
        description: 'God Bless!',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 600, 0, 0, 0],
        average: 50,
        total: 600,
      },
      {
        description: '6188689-Don fr Iraqi donors',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 350, 0, 0],
        average: 29,
        total: 350,
      },
      {
        description: 'Adj 1-27421577224/2 Chicago',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 0, 0],
        average: 17,
        total: 200,
      },
      {
        description: 'Adj 1-27695685171/2 Chicago',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0],
        average: 25,
        total: 300,
      },
      {
        description: '6305959-Dons fr Iraqi donor',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 350, 0],
        average: 29,
        total: 350,
      },
      {
        description: 'Adj 1-26147640545/4 Chicago',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        average: 42,
        total: 500,
      },
      {
        description: "Adj 1-27966075155/2 King's",
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5120, 0],
        average: 427,
        total: 5120,
      },
      {
        description: 'Fr Parrett, J to Salam and',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 75, 75],
        average: 13,
        total: 150,
      },
      {
        description: 'Keep up the good work.',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 0],
        average: 50,
        total: 600,
      },
      {
        description: '6384581-Dons from Iraqi don',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 350],
        average: 29,
        total: 350,
      },
      {
        description: 'Adj 1-26147640545/5 Chicago',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500],
        average: 42,
        total: 500,
      },
      {
        description: 'Adj 1-28014537535/2 Haddad,',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50],
        average: 4,
        total: 50,
      },
      {
        description: 'Total',
        monthly: [
          7120, 6440, 6120, 7705, 8385, 7425, 11406, 36148, 12519, 11179, 20265,
          20790,
        ],
        average: 12959,
        total: 155505,
      },
    ],
    months: [
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
    ],
  },
  ministryExpenses: {
    data: [
      {
        description: 'Supplies and Materials',
        monthly: [0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 17,
        total: 200,
      },
      {
        description: 'Business Auto Mileage',
        monthly: [0, 0, 0, 0, 0, 0, 565, 0, 488, 253, 818, 0],
        average: 177,
        total: 2124,
      },
      {
        description: 'Lodging',
        monthly: [0, 0, 0, 0, 0, 0, 158, 0, 123, 0, 0, 0],
        average: 23,
        total: 282,
      },
      {
        description: 'Meals and Lodging/per diem',
        monthly: [0, 0, 0, 0, 0, 0, 157, 0, 301, 0, 13, 0],
        average: 39,
        total: 470,
      },
      {
        description: 'Travel - Air, Bus, Taxi',
        monthly: [0, 0, 0, 0, 0, 0, 1238, 0, 0, 0, 0, 0],
        average: 103,
        total: 1238,
      },
      {
        description: 'Printing, Stationery & Copying',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0],
        average: 1,
        total: 15,
      },
      {
        description: 'Training & Dev: Books/Periodic',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 34, 0, 0, 0],
        average: 3,
        total: 34,
      },
      {
        description: 'Travel - Tolls, Parking',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 80, 0],
        average: 7,
        total: 83,
      },
      {
        description: 'Total',
        monthly: [0, 0, 200, 0, 0, 0, 2118, 0, 965, 253, 910, 0],
        average: 370,
        total: 4445,
      },
    ],
    months: [
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
    ],
  },
  healthcareExpenses: {
    data: [
      {
        description: 'Single/Husband/Widow EOBs',
        monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
        average: 161,
        total: 1933,
      },
      {
        description: 'Total',
        monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
        average: 161,
        total: 1933,
      },
    ],
    months: [
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
    ],
  },
  misc: {
    data: [
      {
        description: 'AUGUST 2024',
        monthly: [26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'Charge(s) for Credit Card gift(s)',
        monthly: [23, 23, 23, 45, 22, 22, 28, 24, 28, 29, 186, 55],
        average: 42,
        total: 507,
      },
      {
        description: 'Fr Gharib, Mo to Michael Is',
        monthly: [50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0],
        average: 29,
        total: 350,
      },
      {
        description: 'Fr Gharib, Mo to Sameh Emil',
        monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        average: 58,
        total: 700,
      },
      {
        description: 'transfer to rtrav - indef.',
        monthly: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        average: 100,
        total: 1200,
      },
      {
        description: 'OCT 2024',
        monthly: [0, 0, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'SEPTEMBER 2024',
        monthly: [0, 0, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'OCTOBER 2024',
        monthly: [0, 0, 0, 26, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'Partnership with The Martee',
        monthly: [0, 0, 0, 0, 50, 50, 50, 0, 0, 0, 0, 0],
        average: 13,
        total: 150,
      },
      {
        description: 'DECEMBER 2024',
        monthly: [0, 0, 0, 0, 0, 26, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'Fr Gharib, Mo to Sinan Alme',
        monthly: [0, 0, 0, 0, 0, 50, 50, 0, 0, 0, 0, 0],
        average: 8,
        total: 100,
      },
      {
        description: 'CRUW25-Reg-Barbary, Mouna',
        monthly: [0, 0, 0, 0, 0, 0, 760, 0, 0, 0, 0, 0],
        average: 63,
        total: 760,
      },
      {
        description: 'CRUW25-Reg-Barbary, Salam',
        monthly: [0, 0, 0, 0, 0, 0, 2100, 0, 0, 0, 0, 0],
        average: 175,
        total: 2100,
      },
      {
        description: 'JANUARY 2025',
        monthly: [0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        description: 'FEB 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 218, 0, 0, 0, 0],
        average: 18,
        total: 218,
      },
      {
        description: 'Transfer to Barbary',
        monthly: [0, 0, 0, 0, 0, 0, 0, 7573, 0, 0, 0, 0],
        average: 631,
        total: 7573,
      },
      {
        description: 'MARCH 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 177, 0, 0, 0],
        average: 15,
        total: 177,
      },
      {
        description: 'NSO W25 BANQUET',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 0],
        average: 5,
        total: 60,
      },
      {
        description: 'APRIL 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 195, 0, 0],
        average: 16,
        total: 195,
      },
      {
        description: 'Gift to David Yowakim',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0],
        average: 42,
        total: 500,
      },
      {
        description: 'Gift to Martin & Maryam',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50],
        average: 8,
        total: 100,
      },
      {
        description: 'Gift to Michael and Sara',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50],
        average: 8,
        total: 100,
      },
      {
        description: 'MAY 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 0],
        average: 8,
        total: 90,
      },
      {
        description: 'Martin & Maryam, Mar to May',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 0],
        average: 13,
        total: 150,
      },
      {
        description: 'Michael and Sara, April+May',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0],
        average: 8,
        total: 100,
      },
      {
        description: 'Sinan, March to June',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 0],
        average: 17,
        total: 200,
      },
      {
        description: 'Gift to Noor Anay',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50],
        average: 4,
        total: 50,
      },
      {
        description: 'Gift to Sinan',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50],
        average: 4,
        total: 50,
      },
      {
        description: 'JUNE 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 180],
        average: 15,
        total: 180,
      },
      {
        description: 'STAFFCARD JULY 2025',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52],
        average: 4,
        total: 52,
      },
      {
        description: 'Total',
        monthly: [
          299, 273, 325, 322, 322, 398, 3264, 7915, 365, 324, 1426, 587,
        ],
        average: 1318,
        total: 15820,
      },
    ],
    months: [
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
    ],
  },
  other: {
    data: [
      {
        description: 'Staff Assessment',
        monthly: [
          812, 731, 692, 883, 964, 789, 907, 989, 1176, 1227, 2237, 2372,
        ],
        average: 1148,
        total: 13779,
      },
      {
        description: 'Staff Benefits Charge',
        monthly: [
          1096, 1096, 1096, 1096, 1096, 1204, 1204, 1225, 2093, 2093, 2093,
          2093,
        ],
        average: 1457,
        total: 17483,
      },
      {
        description: 'Staff Salary',
        monthly: [
          4428, 4428, 4428, 4428, 4428, 4486, 5984, 8627, 8627, 8627, 8627,
          8627,
        ],
        average: 6312,
        total: 75746,
      },
      {
        description: 'Total',
        monthly: [
          6336, 6254, 6216, 6406, 6488, 6479, 8095, 10841, 11896, 11948, 12957,
          13092,
        ],
        average: 8917,
        total: 107008,
      },
    ],
    months: [
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
    ],
  },
};
