function isNumeric(str: any): boolean {
  if (typeof str != "string" && typeof str != "number") return false;
  return !isNaN(str as any) && !isNaN(parseFloat(str as any));
}

export { isNumeric };
