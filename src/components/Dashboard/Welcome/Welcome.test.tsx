import React from 'react';
import MockDate from 'mockdate';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import Welcome from '.';

describe('Welcome', () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe('morning', () => {
    beforeEach(() => {
      MockDate.set(new Date(2000, 1, 1, 0));
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
      MockDate.set(new Date(2000, 1, 1, 12));
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
      MockDate.set(new Date(2000, 1, 1, 18));
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
