// Single source of truth for the invitation details, guest personalisation and the Google Sheets endpoint.

export const WEDDING = {
  groom: {
    name: 'Maduranga',
    parents: 'Son of the late Mr. H.W. Ariyadasa & the late Mrs. Wilta Jayasinghe',
    phone: '071-5990273',
  },
  bride: {
    name: 'Bimali',
    parents: 'Daughter of Mr. R.S. Ranjith & Mrs. K.V.N. Nilmini',
    phone: '071-0552925',
  },
  date: new Date('2026-11-20T09:00:00+05:30'),
  dayLabel: 'Friday, November 20',
  yearLabel: 'The Year Two Thousand Twenty Six',
  longDate: 'Friday, 20 November 2026',
  shortDate: '20 . 11 . 2026',
  monthYear: 'November 2026',
  timeRange: '9.00 AM – 4.00 PM',
  poruwaTime: '9.45 AM',
  venue: 'Hotel Green Garden',
  city: 'Hikkaduwa',
  mapsLink: 'https://maps.app.goo.gl/6f1uFw5ULRd7XaoZ7',
  mapsEmbed: 'https://maps.google.com/maps?q=Hotel+Green+Garden+Hikkaduwa&t=&z=15&ie=UTF8&iwloc=&output=embed',
};

// Deployed Apps Script Web App (google-apps-script/code.gs); VITE_GOOGLE_APPS_SCRIPT_URL in .env overrides it.
export const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzTXeLa9QXFueoUg_fsvV2A9rQgDNvORZu-9VVKs_1_LZEFiAgepu4cZ3ThDy_PhMg/exec';

export const PREFIXES = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'] as const;
export type Prefix = (typeof PREFIXES)[number];

// "Dear" is a greeting style, not part of the name, so it is never duplicated in "Dear {displayName}".
export function formatDisplayName(prefix: Prefix, name: string): string {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  switch (prefix) {
    case 'Family':
      return `${clean} and Family`;
    case 'Dear':
      return clean;
    default:
      return `${prefix} ${clean}`;
  }
}

export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(displayName)}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groom.name} & ${WEDDING.bride.name}`;
}

// Reads the guest from /{displayName}; falls back to the older ?prefix=&name= links.
export function getGuestDisplayName(): string {
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (segment && segment !== 'admin' && !segment.includes('/')) {
    try {
      return decodeURIComponent(segment).trim();
    } catch {
      return '';
    }
  }
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name')?.trim();
  if (!name) return '';
  const prefix = params.get('prefix')?.trim();
  return prefix ? `${prefix} ${name}` : name;
}

// Posts as form fields with no-cors so Apps Script receives e.parameter without a CORS preflight.
export async function postToSheet(sheet: 'RSVP' | 'Wishes', fields: Record<string, string>) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not configured');
  }
  const body = new URLSearchParams({ sheet, ...fields });
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
}
