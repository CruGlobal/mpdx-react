import { LegendProps } from 'recharts';
import theme from 'src/theme';

type LegendPayload = NonNullable<LegendProps['payload']>[number];

interface ChartLegendContentProps {
  payload?: LegendPayload[];
}

export const ChartLegendContent: React.FC<ChartLegendContentProps> = ({
  payload,
}) => {
  return (
    <ul
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        gap: '0.5rem',
        padding: 0,
      }}
    >
      {payload?.map((entry, index) => (
        <li
          key={`item-${index}`}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span
            className="legend-swatch"
            style={{
              width: 14,
              height: 14,
              backgroundColor: entry.color,
              marginRight: 6,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          />
          <span style={{ color: theme.palette.chartBlack.main }}>
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};
