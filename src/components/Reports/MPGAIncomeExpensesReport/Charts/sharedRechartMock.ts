import * as React from 'react';

const Original = jest.requireActual('recharts');

Original.Pie.defaultProps = {
  ...Original.Pie.defaultProps,
  isAnimationActive: false,
};

const MockResponsiveContainer = ({ aspect, children }) => {
  const width = 800;
  const height = aspect ? Math.round(width / aspect) : 400;
  return React.createElement(
    'div',
    {
      className: 'recharts-responsive-container',
      style: { width, height },
    },
    React.cloneElement(React.Children.only(children), { width, height }),
  );
};

jest.mock('recharts', () => ({
  ...Original,
  ResponsiveContainer: MockResponsiveContainer,
}));
