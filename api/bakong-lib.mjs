const BAKONG_API = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5'
const BAKONG_RENEW = 'https://api-bakong.nbc.gov.kh/v1/renew_token'

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function sendJson(res, status, data) {
  cors(res)
  res.status(status).json(data)
}

/** Vercel often leaves req.body empty — read JSON manually. */
export async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return JSON.parse(req.body)
      } catch {
        return {}
      }
    }
  }
  if (typeof req.json === 'function') {
    try {
      return await req.json()
    } catch {
      /* fall through */
    }
  }
  const raw = await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
  if (!raw.trim()) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function jwtStillValid(token, bufferMs = 15 * 60 * 1000) {
  if (!token?.startsWith('eyJ')) return false
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    if (!payload.exp) return true
    return Date.now() < payload.exp * 1000 - bufferMs
  } catch {
    return false
  }
}

export function getServerJwt() {
  return String(process.env.BAKONG_TOKEN || '').trim()
}

export function transactionPaid(data) {
  const tx = data?.data
  if (!tx || typeof tx !== 'object') return false
  const st = String(tx.status || tx.transactionStatus || '').toUpperCase()
  return (
    st === 'SUCCESS' ||
    st === 'PAID' ||
    st === 'COMPLETED' ||
    st === 'SUCCEEDED' ||
    st === 'ACCEPTED' ||
    st === 'SETTLED' ||
    Boolean(tx.hash) ||
    Boolean(tx.fromAccountId) ||
    Boolean(tx.toAccountId) ||
    Number(tx.acknowledgedDateMs) > 0 ||
    Number(tx.createdDateMs) > 0 ||
    (tx.amount != null && Number(tx.amount) > 0)
  )
}

export async function renewJwt(email, organization, project) {
  const body = {
    email,
    organization: organization || process.env.BAKONG_ORG || 'Dyna Store',
    project: project || process.env.BAKONG_PROJECT || 'dyna_store',
  }
  const rbk = String(process.env.BAKONG_REGISTER_TOKEN || '').trim()
  if (rbk.startsWith('rbk')) body.token = rbk

  const res = await fetch(BAKONG_RENEW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

export async function callCheckMd5(md5, bearer) {
  let upstream
  try {
    upstream = await fetch(BAKONG_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ md5 }),
    })
  } catch (err) {
    return {
      responseCode: 1,
      errorCode: 1,
      responseMessage: `Cannot reach Bakong API: ${err.message}`,
      data: null,
    }
  }

  const text = await upstream.text()
  if (!text || !text.trim()) {
    return {
      responseCode: 1,
      errorCode: upstream.status === 401 ? 6 : 1,
      responseMessage: `Bakong empty response (HTTP ${upstream.status})`,
      data: null,
    }
  }

  try {
    const json = JSON.parse(text)
    if (!upstream.ok && !json.responseMessage) {
      json.responseMessage = `Bakong HTTP ${upstream.status}`
    }
    return json
  } catch {
    const preview = text.replace(/\s+/g, ' ').slice(0, 120)
    return {
      responseCode: 1,
      errorCode: upstream.status === 401 ? 6 : 1,
      responseMessage:
        upstream.status === 401
          ? 'Bakong unauthorized — renew BAKONG_TOKEN on Vercel'
          : `Bakong returned non-JSON (HTTP ${upstream.status}): ${preview}`,
      data: null,
    }
  }
}
