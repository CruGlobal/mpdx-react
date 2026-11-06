import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionContainer } from './ModalSectionContainer';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <ModalSectionContainer>
      <span>Section field</span>
      <ModalSectionDeleteIcon handleClick={jest.fn()} />
    </ModalSectionContainer>
  </ThemeProvider>
);

const renderSection = () => {
  const { getByText, getByRole } = render(<TestComponent />);
  return {
    section: getByText('Section field').parentElement as HTMLElement,
    deleteButton: getByRole('button', { name: 'Modal Section Delete Icon' }),
  };
};

// The widest phone width before MUI's `sm` breakpoint (600px)
const widestPhoneWidth = 599;

describe('ModalSectionContainer', () => {
  it('uses narrower, equal 32px gutters on phones so the fields stay centered', () => {
    const { section } = renderSection();

    [phoneWidth, widestPhoneWidth].forEach((width) => {
      // Two values: the left and right gutters are the same size
      expect(getStyleAtWidth(section, 'padding', width)).toBe('0px 32px');
      // No one-sided override that would push the fields off center
      expect(getStyleAtWidth(section, 'padding-left', width)).toBe('');
      expect(getStyleAtWidth(section, 'padding-right', width)).toBe('');
    });
  });

  it('keeps the 48px gutters on both sides at 600px and up', () => {
    const { section } = renderSection();

    [600, desktopWidth].forEach((width) => {
      expect(getStyleAtWidth(section, 'padding', width)).toBe('0px 48px');
      expect(getStyleAtWidth(section, 'padding-left', width)).toBe('');
      expect(getStyleAtWidth(section, 'padding-right', width)).toBe('');
    });
  });

  it('moves the delete button down to the bottom of the section on phones', () => {
    const { deleteButton } = renderSection();

    expect(getStyleAtWidth(deleteButton, 'bottom', phoneWidth)).toBe('0');
  });

  it('keeps the delete button vertically centered in the right gutter on desktop', () => {
    const { deleteButton } = renderSection();

    expect(getStyleAtWidth(deleteButton, 'position', desktopWidth)).toBe(
      'absolute',
    );
    expect(getStyleAtWidth(deleteButton, 'right', desktopWidth)).toBe('0');
    expect(getStyleAtWidth(deleteButton, 'top', desktopWidth)).toBe('50%');
    expect(getStyleAtWidth(deleteButton, 'transform', desktopWidth)).toBe(
      'translateY(-50%)',
    );
    expect(getStyleAtWidth(deleteButton, 'bottom', desktopWidth)).toBe('');
  });
});
