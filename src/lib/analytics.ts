export const dispatch = (event: string, data?: Record<string, string>) => {
  const dataLayer = (window as any).dataLayer;
  if (dataLayer) {
    dataLayer.push({
      event,
      ...data,
    });
  }
};
