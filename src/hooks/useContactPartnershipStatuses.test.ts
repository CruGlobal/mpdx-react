import { renderHook } from '@testing-library/react-hooks';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from './useContactPartnershipStatuses';

describe('useContactPartnershipStatuses', () => {
  it('should return correctly formatted contactPartnershipStatuses.test', () => {
    const { result } = renderHook(() => useContactPartnershipStatuses());
    // contactStatuses
    expect(result.current.contactStatuses.ACTIVE).toEqual({
      name: 'active',
      phase: null,
      translated: '-- All Active --',
    });
    expect(result.current.contactStatuses.PARTNER_FINANCIAL).toEqual({
      name: 'Partner - Financial',
      phase: 'PARTNER_CARE',
      translated: 'Partner - Financial',
    });

    //statusArray
    expect(result.current.statusArray[0]).toEqual({
      id: 'NEVER_CONTACTED',
      name: 'New Connection',
      phase: 'CONNECTION',
      translated: 'New Connection',
    });

    //statusMap
    expect(result.current.statusMap).toEqual({
      'Appointment Scheduled': 'APPOINTMENT_SCHEDULED',
      'Ask in Future': 'ASK_IN_FUTURE',
      'Cultivate Relationship': 'CULTIVATE_RELATIONSHIP',
      'Expired Connection': 'EXPIRED_REFERRAL',
      'Follow Up for Decision': 'CALL_FOR_DECISION',
      'Initiate for Appointment': 'CONTACT_FOR_APPOINTMENT',
      'Never Ask': 'NEVER_ASK',
      'New Connection': 'NEVER_CONTACTED',
      'Not Interested': 'NOT_INTERESTED',
      'Partner - Financial': 'PARTNER_FINANCIAL',
      'Partner - Pray': 'PARTNER_PRAY',
      'Partner - Special': 'PARTNER_SPECIAL',
      'Research Abandoned': 'RESEARCH_ABANDONED',
      'Research Contact Info': 'RESEARCH_CONTACT_INFO',
      Unresponsive: 'UNRESPONSIVE',
    });

    // statusMapForFilters
    expect(result.current.statusMapForFilters).toEqual({
      'Appointment Scheduled': 'APPOINTMENT_SCHEDULED',
      'Ask in Future': 'ASK_IN_FUTURE',
      'Cultivate Relationship': 'CULTIVATE_RELATIONSHIP',
      'Expired Connection': 'EXPIRED_REFERRAL',
      'Follow Up for Decision': 'CALL_FOR_DECISION',
      'Initiate for Appointment': 'CONTACT_FOR_APPOINTMENT',
      'Never Ask': 'NEVER_ASK',
      'New Connection': 'NEVER_CONTACTED',
      'Not Interested': 'NOT_INTERESTED',
      'Partner - Financial': 'PARTNER_FINANCIAL',
      'Partner - Pray': 'PARTNER_PRAY',
      'Partner - Special': 'PARTNER_SPECIAL',
      'Research Abandoned': 'RESEARCH_ABANDONED',
      'Research Contact Info': 'RESEARCH_CONTACT_INFO',
      Unresponsive: 'UNRESPONSIVE',
      active: 'ACTIVE',
      hidden: 'HIDDEN',
      null: 'NULL',
    });
  });
  describe('getContactStatusesByPhase', () => {
    it('returns array of Statuses', () => {
      const { result } = renderHook(() => useContactPartnershipStatuses());
      expect(
        result.current.getContactStatusesByPhase(PhaseEnum.PartnerCare),
      ).toEqual([
        StatusEnum.PartnerFinancial,
        StatusEnum.PartnerSpecial,
        StatusEnum.PartnerPray,
      ]);
    });
    it('returns empty array when invalid', () => {
      const { result } = renderHook(() => useContactPartnershipStatuses());
      expect(result.current.getContactStatusesByPhase('invalid')).toEqual([]);
    });
  });
});
