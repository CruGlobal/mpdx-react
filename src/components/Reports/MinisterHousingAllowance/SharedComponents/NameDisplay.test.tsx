import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { mocks } from '../Shared/mockData';
import { NameDisplay } from './NameDisplay';

interface TestComponentProps {
  isMarried?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ isMarried = false }) => {
  return (
    <ThemeProvider theme={theme}>
      <NameDisplay
        isMarried={isMarried}
        staff={mocks[1].staffInfo}
        spouse={isMarried ? mocks[1].spouseInfo : undefined}
      />
    </ThemeProvider>
  );
};

describe('NameDisplay', () => {
  it('renders correctly for a single person', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByText('(000123456)')).toBeInTheDocument();
  });

  it('renders correctly for a married person', () => {
    const { getByText } = render(<TestComponent isMarried={true} />);

    expect(getByText('Doe, John and Jane')).toBeInTheDocument();
    expect(getByText('000123456 and 100123456')).toBeInTheDocument();
  });
});
