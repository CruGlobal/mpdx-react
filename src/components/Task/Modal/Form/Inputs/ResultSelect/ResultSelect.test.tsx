import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { ResultEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { SetResultSelected, handleResultChange } from '../../TaskModalHelper';
import { ResultSelect, ResultSelectProps } from './ResultSelect';

jest.mock('../../TaskModalHelper');

const setFieldValue = jest.fn();
const setResultSelected = jest.fn();

beforeEach(() => {
  handleResultChange as jest.Mock;
  setFieldValue.mockClear();
  setResultSelected.mockClear();
});

beforeEach(() => {});

type ComponentsProps = {
  availableResults: ResultSelectProps['availableResults'];
};

const Components = ({ availableResults }: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <ResultSelect
        availableResults={availableResults}
        setFieldValue={setFieldValue}
        setResultSelected={setResultSelected as unknown as SetResultSelected}
      />
    </TestWrapper>
  </ThemeProvider>
);

const standardAvailableResults = [
  ResultEnum.None,
  ResultEnum.Attempted,
  ResultEnum.AttemptedLeftMessage,
  ResultEnum.Completed,
  ResultEnum.Done,
  ResultEnum.Received,
];

describe('ResultSelect', () => {
  it('does not render when no availableResults', () => {
    const { queryByRole } = render(<Components availableResults={[]} />);
    expect(queryByRole('combobox', { name: 'Result' })).not.toBeInTheDocument();
  });

  it('renders when availableResults', () => {
    const { getByRole } = render(
      <Components availableResults={standardAvailableResults} />,
    );
    expect(getByRole('combobox', { name: 'Result' })).toBeInTheDocument();
  });

  it('fires setFieldValue & setResultSelected on select of an option', () => {
    const { getByRole } = render(
      <Components availableResults={standardAvailableResults} />,
    );

    userEvent.click(getByRole('combobox', { name: 'Result' }));
    expect(getByRole('option', { name: 'Completed' })).toBeInTheDocument();
    userEvent.click(getByRole('option', { name: 'Completed' }));

    expect(handleResultChange).toHaveBeenCalledWith({
      result: ResultEnum.Completed,
      setFieldValue,
      setResultSelected,
    });
  });
});
