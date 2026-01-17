const fs = require('fs')
const path = require('path')

const CLINICS_PATH = path.join(process.cwd(), 'lib', 'data', 'clinics.json')

function main() {
  if (!fs.existsSync(CLINICS_PATH)) {
    throw new Error(`Missing clinics data at ${CLINICS_PATH}`)
  }
  const data = JSON.parse(fs.readFileSync(CLINICS_PATH, 'utf-8'))

  const forbiddenKeys = ['phone', 'email', 'contact']
  const offenders = []

  data.forEach((clinic) => {
    Object.keys(clinic).forEach((k) => {
      const lower = k.toLowerCase()
      if (forbiddenKeys.some((f) => lower.includes(f))) {
        offenders.push({ id: clinic.id, slug: clinic.slug, key: k })
      }
    })
  })

  if (offenders.length) {
    console.error('❌ Forbidden contact fields found in public clinics.json')
    console.table(offenders)
    process.exit(1)
  }

  console.log('✅ No phone/email/contact fields present in public clinics.json')
}

main()



