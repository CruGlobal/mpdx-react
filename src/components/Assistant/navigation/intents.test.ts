import { FILTER_PRESETS, NAVIGATION_INTENT_TYPES, STATUSES } from './intents';

// These lists must equal TYPES, PRESETS and the value keys in mpdx-assistant app/services/navigation_intent.rb
describe('navigation intent vocabulary', () => {
  it('has the nine intent types', () => {
    expect(NAVIGATION_INTENT_TYPES).toEqual([
      'contact',
      'contacts_list',
      'tasks',
      'report',
      'appeal',
      'tools_import',
      'settings',
      'dashboard',
      'coaching',
    ]);
  });

  it('has the seven filter presets', () => {
    expect(FILTER_PRESETS).toEqual([
      'late_by_30',
      'late_by_60',
      'late_by_90',
      'stopped_giving',
      'status_in',
      'newsletter_in',
      'pledge_frequency_in',
    ]);
  });

  it('has the fifteen statuses as API enum values', () => {
    expect(STATUSES).toEqual([
      'NEVER_CONTACTED',
      'ASK_IN_FUTURE',
      'RESEARCH_CONTACT_INFO',
      'CULTIVATE_RELATIONSHIP',
      'CONTACT_FOR_APPOINTMENT',
      'APPOINTMENT_SCHEDULED',
      'CALL_FOR_DECISION',
      'PARTNER_FINANCIAL',
      'PARTNER_SPECIAL',
      'PARTNER_PRAY',
      'NOT_INTERESTED',
      'UNRESPONSIVE',
      'NEVER_ASK',
      'RESEARCH_ABANDONED',
      'EXPIRED_REFERRAL',
    ]);
  });
});
