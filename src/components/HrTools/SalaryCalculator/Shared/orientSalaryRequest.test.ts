import { orientSalaryRequest } from './orientSalaryRequest';

const baseRequest = {
  personNumber: 'user-1',
  salary: 10001,
  spouseSalary: 20001,
  mhaAmount: 10002,
  spouseMhaAmount: 20003,
  salaryCap: 10003,
  spouseSalaryCap: 20003,
  calculations: { effectiveCap: 10004, contributing403bFraction: 0.15 },
  spouseCalculations: { effectiveCap: 20005, contributing403bFraction: 0.25 },
};

describe('orientSalaryRequest', () => {
  it('returns the request unchanged when person numbers match', () => {
    expect(orientSalaryRequest(baseRequest, 'user-1')).toEqual(baseRequest);
  });

  it('swaps user and spouse fields when the spouse created the request', () => {
    const oriented = orientSalaryRequest(baseRequest, 'user-2');

    expect(oriented).toEqual({
      personNumber: 'user-2',
      salary: 20001,
      spouseSalary: 10001,
      mhaAmount: 20003,
      spouseMhaAmount: 10002,
      salaryCap: 20003,
      spouseSalaryCap: 10003,
      calculations: {
        effectiveCap: 20005,
        contributing403bFraction: 0.25,
      },
      spouseCalculations: {
        effectiveCap: 10004,
        contributing403bFraction: 0.15,
      },
    });
  });

  it('passes through nullish requests', () => {
    expect(orientSalaryRequest(null, 'user-1')).toBeNull();
    expect(orientSalaryRequest(undefined, 'user-1')).toBeUndefined();
  });

  it('returns the request unchanged when the user person number is missing', () => {
    expect(orientSalaryRequest(baseRequest, null)).toEqual(baseRequest);
    expect(orientSalaryRequest(baseRequest, undefined)).toEqual(baseRequest);
  });
});
