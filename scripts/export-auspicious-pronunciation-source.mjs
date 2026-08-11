import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local', quiet: true })

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  process.argv[2] || 'outputs/auspicious-names-7348-db-source.csv',
)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const rows = []

for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from('auspicious_names')
    .select('name,pronunciation,meaning')
    .order('name', { ascending: true })
    .range(from, from + 999)

  if (error) throw error
  rows.push(...data)
  if (data.length < 1000) break
}

const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const lines = [
  ['ชื่อมงคล', 'คำอ่าน', 'ความหมาย'].join(','),
  ...rows.map((row) =>
    [row.name, row.pronunciation, row.meaning].map(quote).join(','),
  ),
]

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, `\uFEFF${lines.join('\r\n')}\r\n`, 'utf8')

console.log(JSON.stringify({ rows: rows.length, output: OUTPUT_PATH }))
