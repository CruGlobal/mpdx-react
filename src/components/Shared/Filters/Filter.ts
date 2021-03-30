export type Filter = {
  title: string;
  type: string;
  options: FilterOption[];
};

export type FilterOption = {
  id: string | null;
  name: string;
};
