import React from 'react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { ChartLegendContent } from './ChartLegendContent';

const payload = [
  { value: 'Income', color: theme.palette.success.main },
  { value: 'Expenses', color: theme.palette.error.main },
];

describe('ChartLegendContent', () => {
  it('renders an item per payload entry', () => {
    const { getAllByRole, getByText } = render(
      <ChartLegendContent payload={payload} />,
    );

    expect(getAllByRole('listitem')).toHaveLength(2);
    expect(getByText('Income')).toBeInTheDocument();
    expect(getByText('Expenses')).toBeInTheDocument();
  });

  it('colors each box from its own entry', () => {
    const { getAllByRole } = render(<ChartLegendContent payload={payload} />);

    const boxes = getAllByRole('listitem').map((item) => item.firstChild);

    expect(boxes[0]).toHaveStyle({
      backgroundColor: theme.palette.success.main,
    });
    expect(boxes[1]).toHaveStyle({
      backgroundColor: theme.palette.error.main,
    });
  });

  it('draws a dashed line swatch for a dashed line entry', () => {
    const { getByRole } = render(
      <ChartLegendContent
        payload={[
          {
            value: 'Expenses average: $3,700.00',
            type: 'plainline',
            color: theme.palette.error.dark,
            payload: { strokeDasharray: '6 4' },
          },
        ]}
      />,
    );

    const line = getByRole('listitem').querySelector('line');
    expect(line).toHaveAttribute('stroke', theme.palette.error.dark);
    expect(line).toHaveAttribute('stroke-dasharray', '6 4');
  });

  it('renders no items when recharts supplies no payload', () => {
    const { queryAllByRole } = render(<ChartLegendContent />);

    expect(queryAllByRole('listitem')).toHaveLength(0);
  });
});
