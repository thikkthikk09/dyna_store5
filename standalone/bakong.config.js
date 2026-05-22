/**
 * Public config for GitHub Pages (and local).
 * registerToken = short code from https://api-bakong.nbc.gov.kh/register
 * token = JWT (renew: node scripts/bakong-token.mjs)
 */
window.DYNA_BAKONG_CONFIG = {
  /**
   * Leave empty on Vercel — app uses same-origin /api/check-md5 automatically.
   * GitHub Pages only: paste your Vercel URL, e.g. 'https://dyna-store3.vercel.app'
   */
  apiBase: '',
  /** Do not use localhost here when deployed */
  proxy: '',
  email: 'thikkthikk09@gmail.com',
  registerToken: 'rbk82qAU7sFjn7CG2mAP-CA0_mKVz_RNVRcNlA60b3oNkY',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMWJkOTRjMDY2ODViNGIwMiJ9LCJpYXQiOjE3Nzk0MTY1ODksImV4cCI6MTc4NzE5MjU4OX0.Qv3l-JRX6bjjz7lL_vMmUta1FfXHjEYN5X9LzNQXYIo',
  account: 'ben_sothida@bkrt',
  organization: 'Dyna Store',
  project: 'dyna_store',
}
