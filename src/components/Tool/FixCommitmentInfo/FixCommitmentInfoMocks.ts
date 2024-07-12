import { ErgonoMockShape } from 'graphql-ergonomock';

export const contactId = 'contactId';

export const mockInvalidStatusesResponse: ErgonoMockShape[] = [
  {
    id: 'tester-1',
    name: 'Tester 1',
    status: 'PARTNER_FINANCIAL',
    pledgeAmount: 0,
    pledgeCurrency: 'USD',
    pledgeFrequency: 'WEEKLY',
    statusValid: false,
  },
  {
    id: 'tester-2',
    name: 'Tester 2',
    status: 'PARTNER_FINANCIAL',
    pledgeAmount: 0,
    pledgeCurrency: 'USD',
    pledgeFrequency: 'WEEKLY',
    statusValid: false,
  },
];
