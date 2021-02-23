import React from 'react';
import { Settings } from 'luxon';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import Welcome from '.';

describe('Welcome', () => {
  afterEach(() => {
    Settings.resetCaches();
  });

  describe('morning', () => {
    beforeEach(() => {
      Settings.now = () => new Date(2000, 1, 1, 0).valueOf();
    });

    it('default', () => {
      const { getByTestId } = render(<Welcome />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Morning,',
      );
    });

    it('props', () => {
      const { getByTestId } = render(<Welcome firstName="John" />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Morning, John.',
      );
    });
  });
  describe('afternoon', () => {
    beforeEach(() => {
      Settings.now = () => new Date(2000, 1, 1, 12).valueOf();
    });

    it('default', () => {
      const { getByTestId } = render(<Welcome />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Afternoon,',
      );
    });

    it('props', () => {
      const { getByTestId } = render(<Welcome firstName="John" />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Afternoon, John.',
      );
    });
  });

  describe('evening', () => {
    beforeEach(() => {
      Settings.now = () => new Date(2000, 1, 1, 18).valueOf();
    });

    it('default', () => {
      const { getByTestId } = render(<Welcome />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Evening,',
      );
    });

    it('props', () => {
      const { getByTestId } = render(<Welcome firstName="John" />);
      expect(getByTestId('PageHeadingHeading').textContent).toEqual(
        'Good Evening, John.',
      );
    });
  });
});
