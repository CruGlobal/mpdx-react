import { DateTime } from 'luxon';

export enum ScheduleEnum {
  OneTime = 'oneTime',
  Monthly = 'monthly',
  Annually = 'annually',
}

export enum StatusEnum {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Complete = 'complete',
  Ended = 'ended',
  Failed = 'failed',
}

export enum StaffSavingFundEnum {
  StaffSavings = 'staffSavings',
  StaffAccount = 'staffAccount',
  StaffConferenceSavings = 'staffConferenceSavings',
}

export interface Fund {
  accountId: string;
  type: StaffSavingFundEnum;
  name: string;
  balance: number;
  pending: number;
}

export interface TransferHistory {
  id?: string;
  transferFrom?: string;
  transferTo?: string;
  amount?: number;
  schedule?: ScheduleEnum;
  status?: StatusEnum;
  transferDate?: DateTime<boolean> | null;
  endDate?: DateTime<boolean> | null;
  note?: string;
  actions?: string;
}

interface MockData {
  accountListId: string;
  accountName: string;
  funds: Fund[];
  history: TransferHistory[];
}

export const mockData: MockData = {
  accountListId: '123456789',
  accountName: 'Test Account',
  funds: [
    {
      accountId: 'staffAccount',
      type: StaffSavingFundEnum.StaffAccount,
      name: 'Staff Account',
      balance: 15000,
      pending: 17500,
    },
    {
      accountId: 'staffConferenceSavings',
      type: StaffSavingFundEnum.StaffConferenceSavings,
      name: 'Staff Conference Savings',
      balance: 500,
      pending: 200,
    },
    {
      accountId: 'staffSavings',
      type: StaffSavingFundEnum.StaffSavings,
      name: 'Staff Savings',
      balance: 2500,
      pending: 0,
    },
  ],
  history: [
    {
      id: crypto.randomUUID(),
      transferFrom: 'staffSavings',
      transferTo: 'staffAccount',
      amount: 2500,
      schedule: ScheduleEnum.OneTime,
      status: StatusEnum.Pending,
      transferDate: DateTime.fromISO('2023-09-26'),
      endDate: null,
      note: 'Reimbursements',
      actions: 'edit-delete',
    },
    {
      id: crypto.randomUUID(),
      transferFrom: 'staffAccount',
      transferTo: 'staffSavings',
      amount: 1200,
      schedule: ScheduleEnum.Monthly,
      status: StatusEnum.Ongoing,
      transferDate: DateTime.fromISO('2023-09-30'),
      endDate: DateTime.fromISO('2025-09-30'),
      note: 'Long-term savings',
      actions: 'edit-delete',
    },
    {
      id: crypto.randomUUID(),
      transferFrom: 'staffSavings',
      transferTo: 'staffAccount',
      amount: 500,
      schedule: ScheduleEnum.OneTime,
      status: StatusEnum.Complete,
      transferDate: DateTime.fromISO('2023-09-29'),
      endDate: null,
      note: 'Tax',
      actions: 'edit-delete',
    },
    {
      id: crypto.randomUUID(),
      transferFrom: 'staffAccount',
      transferTo: 'staffConferenceSavings',
      amount: 120,
      schedule: ScheduleEnum.Monthly,
      status: StatusEnum.Ended,
      transferDate: DateTime.fromISO('2023-09-28'),
      endDate: DateTime.fromISO('2024-06-01'),
      note: 'Cru 25',
      actions: 'edit-delete',
    },
    {
      id: crypto.randomUUID(),
      transferFrom: 'staffAccount',
      transferTo: 'staffConferenceSavings',
      amount: 750,
      schedule: ScheduleEnum.OneTime,
      status: StatusEnum.Failed,
      transferDate: DateTime.fromISO('2023-09-27'),
      endDate: null,
      note: 'X-fer tickets',
      actions: 'edit-delete',
    },
  ],
};
