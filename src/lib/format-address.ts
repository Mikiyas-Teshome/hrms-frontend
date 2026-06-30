export type AddressParts = {
  line?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
};

export function formatAddressLine(parts: AddressParts): string | null {
  const segments: string[] = [];

  const line = parts.line?.trim();
  if (line) {
    segments.push(line);
  }

  const locality = [parts.city?.trim(), parts.state?.trim()].filter(Boolean).join(', ');
  if (locality) {
    segments.push(locality);
  }

  const country = parts.country?.trim();
  if (country) {
    segments.push(country);
  }

  const postal = parts.postalCode?.trim();
  if (postal) {
    segments.push(postal);
  }

  return segments.length > 0 ? segments.join(', ') : null;
}
