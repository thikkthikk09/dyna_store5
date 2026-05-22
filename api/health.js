import { cors, getServerJwt, sendJson } from './bakong-lib.mjs'

export default function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })

  const jwt = getServerJwt()
  const hasEnv = jwt.startsWith('eyJ')
  return sendJson(res, 200, {
    ok: true,
    hasToken: hasEnv,
    hasJwt: hasEnv,
    email: process.env.BAKONG_EMAIL || null,
    hosted: true,
    hint: hasEnv ? null : 'Set BAKONG_TOKEN on Vercel, or send token in POST /api/check-md5 body',
  })
}
