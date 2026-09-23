import { FILTER_PRESETS, NAVIGATION_INTENT_TYPES } from './intents';

// These lists must equal TYPES and PRESETS in mpdx-assistant app/services/navigation_intent.rb
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
});
