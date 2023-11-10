import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme';
import { FieldWrapper } from './FieldWrapper';
import { helperPositionEnum } from './FieldHelper';

describe('FieldWrapper', () => {
  it('Should render children', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <FieldWrapper>Children</FieldWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
  });

  it('Should render labelText', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <FieldWrapper labelText="labelText" />
      </ThemeProvider>,
    );

    expect(getByText('labelText')).toBeInTheDocument();
  });

  it('Should render Helper Text before Children', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <FieldWrapper
          helperText="helperText"
          formHelperTextProps={{
            'data-testid': 'helper-text-top',
          }}
        >
          <p>Children</p>
        </FieldWrapper>
      </ThemeProvider>,
    );

    expect(
      getByTestId('helper-text-top').compareDocumentPosition(
        getByText('Children'),
      ),
    ).toBe(4);
  });
  it('Should render Helper Text after Children', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <FieldWrapper
          helperText="helperText"
          helperPosition={helperPositionEnum.Bottom}
          formHelperTextProps={{
            'data-testid': 'helper-text-bottom',
          }}
        >
          <p>Children</p>
        </FieldWrapper>
      </ThemeProvider>,
    );

    expect(
      getByTestId('helper-text-bottom').compareDocumentPosition(
        getByText('Children'),
      ),
    ).toBe(2);
  });
});
