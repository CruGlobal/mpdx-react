import { DateTime } from 'luxon';

export enum ReminderStatusEnum {
  NotReminded = 'Not Reminded',
  Monthly = 'Monthly',
  BiMonthly = 'Bi-Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'Semi-Annual',
  Annual = 'Annual',
}

export interface ReminderData {
  id: string;
  partner: string;
  partnerId: string;
  lastGift: DateTime | null;
  lastReminder: DateTime | null;
  status: ReminderStatusEnum;
}

export const mockData: ReminderData[] = [
  {
    id: '1',
    partner: 'Adamson, Eugene Michael (Mike) and Marilyn Jean',
    partnerId: '000107504',
    lastGift: DateTime.fromISO('2025-08-13'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '2',
    partner: 'Allen, Elizabeth',
    partnerId: '330756985',
    lastGift: DateTime.fromISO('2025-08-01'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '3',
    partner: 'Andre, Fredrick Maxwell and Dana Renee',
    partnerId: '000393913',
    lastGift: DateTime.fromISO('2025-08-10'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '4',
    partner: 'Arabic Baptist Church',
    partnerId: '417972694',
    lastGift: DateTime.fromISO('2025-08-05'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '5',
    partner: 'Bellamy, Gordon',
    partnerId: '415742207',
    lastGift: DateTime.fromISO('2025-08-08'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '6',
    partner: 'Briarwood Presbyterian Church',
    partnerId: '291412318',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '7',
    partner: 'Cartin, James and Caroline',
    partnerId: '296338310',
    lastGift: DateTime.fromISO('2025-08-22'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '8',
    partner: 'Ruedemann, Robert',
    partnerId: '427386313',
    lastGift: DateTime.fromISO('2025-09-02'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '9',
    partner: 'Schwandt, Andrew',
    partnerId: '427386313',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '10',
    partner: 'Shadid, Elaine',
    partnerId: '467452212',
    lastGift: DateTime.fromISO('2025-08-18'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '11',
    partner: 'Silbak, Marwan and Amal',
    partnerId: '474035895',
    lastGift: DateTime.fromISO('2025-08-18'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '12',
    partner: 'Simmons, Keith and Dawnella',
    partnerId: '317690780',
    lastGift: DateTime.fromISO('2025-08-10'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '13',
    partner: 'Smith, Harriet',
    partnerId: '000048486',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '14',
    partner: 'Street Jr, Donald Richard (Rich) and Kourtney Goerges',
    partnerId: '000401460',
    lastGift: DateTime.fromISO('2025-08-10'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '15',
    partner: 'Terry, Thomas and Diane',
    partnerId: '000451569',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '16',
    partner: 'Wall, Rebekah Lynn (Becky)',
    partnerId: '000556075',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '17',
    partner: 'Wong, Brien and Saroj',
    partnerId: '444778932',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '18',
    partner: 'Zapata, Gloria',
    partnerId: '427358560',
    lastGift: DateTime.fromISO('2025-08-15'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
  {
    id: '19',
    partner: 'Zou, Jinwang and Jin, Yichen',
    partnerId: '427358560',
    lastGift: DateTime.fromISO('2025-08-11'),
    lastReminder: null,
    status: ReminderStatusEnum.NotReminded,
  },
];
