import {
  getBoardApprovalEligibility,
  getHousingKind,
  getMhiEligibility,
} from './housingAllowance';

const italianHcm = {
  staffInfo: { country: 'IT' },
  mhaEit: { mhaEligibility: false },
  mhiEit: { mhiEligibility: true },
};
const usHcm = {
  staffInfo: { country: 'US' },
  mhaEit: { mhaEligibility: true },
  mhiEit: { mhiEligibility: false },
};

describe('getHousingKind', () => {
  it('returns MHI for Italy', () => {
    expect(getHousingKind('IT')).toBe('MHI');
  });

  it('returns MHA for everything else', () => {
    expect(getHousingKind('US')).toBe('MHA');
    expect(getHousingKind(null)).toBe('MHA');
  });
});

describe('getMhiEligibility', () => {
  it('is true when mhiEit.mhiEligibility is true', () => {
    expect(getMhiEligibility(italianHcm)).toBe(true);
  });

  it('is false when mhiEit.mhiEligibility is false or hcm is missing', () => {
    expect(getMhiEligibility(usHcm)).toBe(false);
    expect(getMhiEligibility(null)).toBe(false);
  });
});

describe('getBoardApprovalEligibility', () => {
  it('uses MHI flag for Italian staff', () => {
    expect(
      getBoardApprovalEligibility({
        staffInfo: { country: 'IT' },
        mhaBoardApproval: { mhaEligibility: false },
        mhiEit: { mhiEligibility: true },
      }),
    ).toBe(true);
    expect(
      getBoardApprovalEligibility({
        staffInfo: { country: 'IT' },
        mhaBoardApproval: { mhaEligibility: true },
        mhiEit: { mhiEligibility: false },
      }),
    ).toBe(false);
  });

  it('uses the salary MHA flag, not mhaEit, for non-Italian staff', () => {
    const boardApprovedWithoutIbs = {
      staffInfo: { country: 'US' },
      mhaEit: { mhaEligibility: false },
      mhaBoardApproval: { mhaEligibility: true },
      mhiEit: { mhiEligibility: false },
    };
    const ibsWithoutBoardApproval = {
      staffInfo: { country: 'US' },
      mhaEit: { mhaEligibility: true },
      mhaBoardApproval: { mhaEligibility: false },
      mhiEit: { mhiEligibility: false },
    };

    expect(getBoardApprovalEligibility(boardApprovedWithoutIbs)).toBe(true);
    expect(getBoardApprovalEligibility(ibsWithoutBoardApproval)).toBe(false);
  });

  it('returns false when hcm is null', () => {
    expect(getBoardApprovalEligibility(null)).toBe(false);
  });
});
