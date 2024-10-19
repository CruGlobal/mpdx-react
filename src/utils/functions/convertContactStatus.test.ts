import { StatusEnum } from 'src/graphql/types.generated';
import { convertStatus } from './convertContactStatus';

describe('convertContactStatus', () => {
  it('converts to StatusEnum or null', () => {
    // new lowercase status
    expect(convertStatus('partner_financial')).toEqual(
      StatusEnum.PartnerFinancial,
    );
    // uppercase ENUM
    expect(convertStatus('CONTACT_FOR_APPOINTMENT')).toEqual(
      StatusEnum.ContactForAppointment,
    );
    // invalid
    expect(convertStatus('hidden')).toEqual(null);
    expect(convertStatus(undefined)).toEqual(null);
    expect(convertStatus('')).toEqual(null);
  });

  it('converts old status format to StatusEnum or null', () => {
    expect(convertStatus('Partner - Financial')).toEqual(
      StatusEnum.PartnerFinancial,
    );
    expect(convertStatus('Partner - Special')).toEqual(
      StatusEnum.PartnerSpecial,
    );
    expect(convertStatus('Call for Decision')).toEqual(
      StatusEnum.CallForDecision,
    );
    expect(convertStatus('Expired Referral')).toEqual(
      StatusEnum.ExpiredReferral,
    );
    expect(convertStatus('Cultivate Relationship')).toEqual(
      StatusEnum.CultivateRelationship,
    );
    expect(convertStatus('Partner - Pray')).toEqual(StatusEnum.PartnerPray);
    expect(convertStatus('Ask in Future')).toEqual(StatusEnum.AskInFuture);
    expect(convertStatus('Not Interested')).toEqual(StatusEnum.NotInterested);
    expect(convertStatus('Never Contacted')).toEqual(StatusEnum.NeverContacted);
    expect(convertStatus('Unresponsive')).toEqual(StatusEnum.Unresponsive);
    expect(convertStatus('Never Ask')).toEqual(StatusEnum.NeverAsk);
  });
});
