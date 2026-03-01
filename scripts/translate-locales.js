const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function translateJson(sourceObj, targetLang) {
    const prompt = `Translate the following JSON string values strictly into ${targetLang}. 
Do not change ANY keys, only translate the values. 
Keep the exact same JSON structure structure. 
Reply with ONLY the raw valid JSON, no markdown formatting (do not wrap in \`\`\`json).

JSON:
${JSON.stringify(sourceObj, null, 2)}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return JSON.parse(data.choices[0].message.content)
}

async function main() {
    const messagesDir = path.join(__dirname, '../messages')
    const enFile = path.join(messagesDir, 'en.json')
    const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'))

    const localesToTranslate = [
        { code: 'ar', name: 'Arabic' },
        { code: 'fr', name: 'French' },
        { code: 'id', name: 'Indonesian' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'th', name: 'Thai' },
        { code: 'ms', name: 'Malay' },
        { code: 'sw', name: 'Swahili' },
    ]

    for (const locale of localesToTranslate) {
        console.log(`Translating to ${locale.name} (${locale.code})...`)
        try {
            const translatedData = await translateJson(enData, locale.name)
            const targetFile = path.join(messagesDir, `${locale.code}.json`)
            fs.writeFileSync(targetFile, JSON.stringify(translatedData, null, 2))
            console.log(`✅ Saved ${targetFile}`)
        } catch (err) {
            console.error(`❌ Failed to translate ${locale.code}:`, err.message)
        }
    }
}

main().catch(console.error)
