import { ExcludedAppealContactReasonEnum } from 'src/graphql/types.generated';
import { getLocalizedExcludedFromAppealReasons } from './getLocalizedExcludedFromAppealReasons';

const t = jest.fn().mockImplementation((message) => message);

describe('getRouterQueryParam', () => {
  it('IncreasedRecently', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.IncreasedRecently,
      ),
    ).toEqual('Increased Recently');
  });
  it('JoinedRecently', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.JoinedRecently,
      ),
    ).toEqual('Joined Recently');
  });
  it('MarkedDoNotAsk', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.MarkedDoNotAsk,
      ),
    ).toEqual('Marked Do Not Ask');
  });
  it('PledgeAmountIncreasedRange', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.PledgeAmountIncreasedRange,
      ),
    ).toEqual('May have increased their giving in the last 3 months');
  });
  it('PledgeLateBy', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.PledgeLateBy,
      ),
    ).toEqual('May have missed a gift in the last 30-90 days');
  });
  it('StartedGivingRange', () => {
    expect(
      getLocalizedExcludedFromAppealReasons(
        t,
        ExcludedAppealContactReasonEnum.StartedGivingRange,
      ),
    ).toEqual('May have joined my team in the last 3 months');
  });
});
