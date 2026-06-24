import { useEffect, useMemo, useState } from 'react';
import { EmployeeData } from './mockData';

interface StaffPageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

interface StaffConnection {
  nodes: EmployeeData[];
  pageInfo: StaffPageInfo;
}

interface UseMockInfiniteStaffResult {
  data: StaffConnection;
  // TODO(MPDX): replace with real Apollo fetchMore + loading once backend is wired.
  loading: boolean;
  fetchMore: () => void;
}

export const useMockInfiniteStaff = (
  allItems: EmployeeData[],
  pageSize = 25,
): UseMockInfiniteStaffResult => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [allItems]);

  const data = useMemo<StaffConnection>(() => {
    const nodes = allItems.slice(0, page * pageSize);
    return {
      nodes,
      pageInfo: {
        endCursor: String(nodes.length),
        hasNextPage: nodes.length < allItems.length,
      },
    };
  }, [allItems, page, pageSize]);

  const fetchMore = () => {
    if (data.pageInfo.hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  return { data, loading: false, fetchMore };
};
