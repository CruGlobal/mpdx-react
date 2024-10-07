export const editableSources = ['MPDX', 'manual', 'TntImport'];

export const isEditableSource = (source: string) =>
  editableSources.indexOf(source) > -1;
