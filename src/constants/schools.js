// Supported campuses at launch.
// emailDomain is used to verify a student's .edu email on sign up
// and to scope listings to only that campus.
export const SCHOOLS = [
  {
    id: 'tufts',
    name: 'Tufts University',
    emailDomain: 'tufts.edu',
  },
  {
    id: 'northeastern',
    name: 'Northeastern University',
    emailDomain: 'northeastern.edu',
  },
];

export function schoolFromEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return SCHOOLS.find((s) => domain === s.emailDomain) || null;
}
