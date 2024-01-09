import { groupItems } from './groupItems';

describe('groupItems', () => {
  it('creates no groups when groupBy is missing', () => {
    expect(groupItems([0, 1, 2], undefined)).toEqual({
      items: [0, 1, 2],
      groupCounts: [],
      groupLabels: [],
    });
  });

  it('groups items and sorts by order', () => {
    const data = [0, 1, 2, 3, 4];
    const groupBy = (id: number) => {
      if (id === 1 || id === 2) {
        return { label: 'Charlie', order: 1 };
      } else if (id === 0 || id === 4) {
        return { label: 'Bravo', order: 2 };
      } else {
        return { label: 'Alpha', order: 3 };
      }
    };

    expect(groupItems(data, groupBy)).toEqual({
      items: [1, 2, 0, 4, 3],
      groupCounts: [2, 2, 1],
      groupLabels: ['Charlie', 'Bravo', 'Alpha'],
    });
  });

  it('groups items and sorts by label when order is missing', () => {
    const data = [0, 1, 2, 3, 4];
    const groupBy = (id: number) => {
      if (id === 1 || id === 2) {
        return { label: 'Charlie' };
      } else if (id === 0 || id === 4) {
        return { label: 'Bravo' };
      } else {
        return { label: 'Alpha' };
      }
    };

    expect(groupItems(data, groupBy)).toEqual({
      items: [3, 0, 4, 1, 2],
      groupCounts: [1, 2, 2],
      groupLabels: ['Alpha', 'Bravo', 'Charlie'],
    });
  });
});
