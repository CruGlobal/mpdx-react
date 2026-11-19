import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EligibleDisplay, EligibleDisplayProps } from './EligibleDisplay';

const TestComponent: React.FC<EligibleDisplayProps> = (props) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <EligibleDisplay {...props} />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('EligibleDisplay', () => {
  it('should render message when isPending is true', () => {
    const { getByText } = render(<TestComponent isPending isEditable />);

    expect(getByText(/waiting to be processed/i)).toBeInTheDocument();
    expect(
      getByText(/click on the "edit request" button below/i),
    ).toBeInTheDocument();
  });

  it('should hide editing message when isEditable is false', () => {
    const { queryByText } = render(
      <TestComponent isPending isEditable={false} />,
    );

    expect(
      queryByText(/click on the "edit request" button below/i),
    ).not.toBeInTheDocument();
  });

  it('should point to Request New MHA when approved only in HCM', () => {
    const { getByText, queryByText } = render(
      <TestComponent isPending={false} isEditable={false} isHcmApprovedOnly />,
    );

    expect(getByText(/you have an approved mha amount/i)).toBeInTheDocument();
    expect(getByText(/click "request new mha"/i)).toBeInTheDocument();
    expect(queryByText(/view current mha/i)).not.toBeInTheDocument();
  });

  it('should render message when isPending is false', () => {
    const { getByText } = render(
      <TestComponent isPending={false} isEditable={false} />,
    );

    expect(
      getByText(/our records indicate that you have an approved mha amount/i),
    ).toBeInTheDocument();
    expect(getByText(/click "update current mha"/i)).toBeInTheDocument();
  });

  it('should not point to Update Current MHA when a new MHA cannot be requested', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        isPending={false}
        isEditable={false}
        canRequestNewMha={false}
      />,
    );

    expect(getByText(/click on the "view current mha"/i)).toBeInTheDocument();
    expect(queryByText(/update current mha/i)).not.toBeInTheDocument();
  });

  it('should not point to Request New MHA when approved only in HCM and a new MHA cannot be requested', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        isPending={false}
        isEditable={false}
        isHcmApprovedOnly
        canRequestNewMha={false}
      />,
    );

    expect(
      getByText('Our records indicate that you have an approved MHA amount.'),
    ).toBeInTheDocument();
    expect(queryByText(/request new mha/i)).not.toBeInTheDocument();
  });
});
