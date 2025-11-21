import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { mocks } from '../../../Shared/mockData';
import { PersonInfo } from './PersonInfo';

const name = mocks[4].staffInfo.name;
const id = mocks[4].staffInfo.id;
const email = mocks[4].staffInfo.email;
const phone = mocks[4].staffInfo.phone;
const line1 = mocks[4].staffInfo.location.line1;
const line2 = mocks[4].staffInfo.location.line2;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <PersonInfo />
    </TestRouter>
  </ThemeProvider>
);

describe('PersonInfo', () => {
  it('renders personal contact information', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Personal Contact Information')).toBeInTheDocument();

    expect(getByText(name)).toBeInTheDocument();
    expect(getByText(`Staff Account Number: ${id}`)).toBeInTheDocument();
    expect(getByText(line1)).toBeInTheDocument();
    expect(getByText(`Email: ${email}`)).toBeInTheDocument();
    expect(getByText(line2)).toBeInTheDocument();
    expect(getByText(`Phone number: ${phone}`)).toBeInTheDocument();
  });
});
