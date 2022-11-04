import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { render } from '../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../__tests__/util/TestWrapper';
import theme from '../../theme';
import NoData from './NoData';

describe('Tool-NoData', () => {
  it('render text for fix commitment info tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="fixCommitmentInfo" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No contacts with commitment info need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Contacts with possibly incorrect commitment info will appear here.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-null-state')).toBeInTheDocument();
  });

  it('render text for fix mailing addresses tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="fixMailingAddresses" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No contacts with mailing addresses need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Contacts with new addresses or multiple primary mailing addresses will appear here.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('fixMailingAddresses-null-state')).toBeInTheDocument();
  });

  it('render text for fix send newsletter tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="fixSendNewsletter" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No contacts with an empty newsletter status need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Contacts that appear here have an empty newsletter status and partner status set to financial, special, or pray.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('fixSendNewsletter-null-state')).toBeInTheDocument();
  });

  it('render text for merge contacts tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="mergeContacts" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No duplicate contacts need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with similar names and partner account numbers will appear here.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('mergeContacts-null-state')).toBeInTheDocument();
  });

  it('render text for fix email addresses tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="fixEmailAddresses" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new email addresses or multiple primary email addresses will appear here.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('fixEmailAddresses-null-state')).toBeInTheDocument();
  });

  it('render text for fix phone numbers tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="fixPhoneNumbers" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new phone numbers or multiple primary phone numbers will appear here.',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('fixPhoneNumbers-null-state')).toBeInTheDocument();
  });

  it('render text for merge people tool', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoData tool="mergePeople" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText('No duplicate people need attention')).toBeInTheDocument();
    expect(
      getByText('People with similar names will appear here.'),
    ).toBeInTheDocument();
    expect(getByTestId('mergePeople-null-state')).toBeInTheDocument();
  });
});
