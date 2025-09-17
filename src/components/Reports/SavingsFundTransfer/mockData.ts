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

export enum FundTypeEnum {
  Primary = 'Primary',
  Savings = 'Savings',
}

export enum TransferTypeEnum {
  New = 'new',
  Edit = 'edit',
}

export interface TransferModalData {
  type?: TransferTypeEnum;
  transfer: TransferHistory;
}

export interface SubCategory {
  id: string;
  name: string;
}
export interface RecurringTransfer {
  id?: string | null;
  recurringStart?: DateTime | null;
  recurringEnd?: DateTime | null;
  active?: boolean | null;
}

export interface Transfer {
  sourceFundTypeName: string;
  destinationFundTypeName: string;
}

export interface Transactions {
  id: string;
  amount: number;
  description?: string | null;
  transactedAt: DateTime;
  subCategory: SubCategory;
  transfer: Transfer;
  recurringTransfer?: RecurringTransfer | null;
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
  recurringId?: string | null;
}

export const fundsMock = [
  {
    id: '1',
    fundType: 'Staff Account',
    balance: 15000,
    deficitLimit: 0,
  },
  {
    id: '2',
    fundType: 'Staff Savings',
    balance: 2500,
    deficitLimit: 0,
  },
];

export const mockData: TransferHistory[] = [
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
];
