/**
 * Converts string to date
 * @param value format DD/MM/YYYY
 * @returns Date
 */
export const getDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const lastDateComponents = value.split("/"); 
  if (lastDateComponents && lastDateComponents.length == 3) {
    return new Date(Date.UTC(
      Number(lastDateComponents[2]), 
      Number(lastDateComponents[1]) - 1,
      Number(lastDateComponents[0])
    ));
  }
  return null;
};
