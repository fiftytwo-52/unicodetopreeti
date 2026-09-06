/**
 * Site-wide values that are not part of the conversion logic.
 *
 * Kept in one file so the contact address is changed once rather than in every
 * page and template that prints it.
 */

/** Replace before deploying. Printed on the contact and advertise pages. */
export const CONTACT_EMAIL = 'gun-yes@proton.me';

export const SITE_NAME = 'unicodeTOpreeti';

/**
 * A mailto link with the subject filled in, so reports arrive already sorted
 * rather than as a pile of untitled mail.
 */
export function mailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
