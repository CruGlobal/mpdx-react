import React from 'react';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from './GoalCalculatorHelper';

describe('GoalCalculatorHelper', () => {
  it('should have correct step enum values', () => {
    expect(GoalCalculatorStepEnum.CalculatorSettings).toBe(
      'calculator-settings',
    );
    expect(GoalCalculatorStepEnum.SummaryReport).toBe('summary-report');
  });

  it('should have correct category enum values', () => {
    expect(GoalCalculatorCategoryEnum.Settings).toBe('settings');
    expect(GoalCalculatorCategoryEnum.Housing).toBe('housing');
    expect(GoalCalculatorCategoryEnum.MPD).toBe('mpd');
    expect(GoalCalculatorCategoryEnum.Overview).toBe('overview');
  });

  it('should accept valid category object', () => {
    const mockCategory: GoalCalculatorCategory = {
      id: GoalCalculatorCategoryEnum.Settings,
      title: 'Test Category',
      component: React.createElement('div'),
    };

    expect(mockCategory.id).toBe('settings');
    expect(mockCategory.component).toBeDefined();
  });

  it('should accept a valid step object', () => {
    const mockStep: GoalCalculatorStep = {
      title: 'Test Step',
      id: GoalCalculatorStepEnum.CalculatorSettings,
      categories: [
        {
          id: GoalCalculatorCategoryEnum.Settings,
          title: 'Test Category 1',
          component: React.createElement('div'),
          rightPanelComponent: React.createElement('div'),
        },
        {
          id: GoalCalculatorCategoryEnum.Settings,
          title: 'Test Category 2',
          component: React.createElement('div'),
          rightPanelComponent: React.createElement('div'),
        },
      ],
      icon: React.createElement('span'),
    };

    expect(mockStep.id).toBe('calculator-settings');
    expect(mockStep.categories).toHaveLength(2);
    expect(mockStep.icon).toBeDefined();
  });
});
