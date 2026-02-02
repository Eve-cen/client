export const detectCardType = (number) => {
  const clean = number?.replace(/\s+/g, "");

  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^(5060|5061|5078|5079|6500)/.test(clean)) return "verve";
  return "unknown";
};
