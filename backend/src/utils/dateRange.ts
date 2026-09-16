export function getCurrentMonthDateRange(referenceDate = new Date()) {
  return {
    gte: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
    lt: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
  };
}
