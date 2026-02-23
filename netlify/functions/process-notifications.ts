import type { Config } from '@netlify/functions'

/**
 * Netlify scheduled function: calls the notification processing API every 5 minutes.
 * Requires CRON_SECRET and NEXT_PUBLIC_APP_URL to be set in Netlify environment variables.
 */
export default async function handler(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const cronSecret = process.env.CRON_SECRET

  if (!appUrl) {
    console.error('[process-notifications] NEXT_PUBLIC_APP_URL is not set')
    return
  }

  const url = `${appUrl}/api/notifications/process`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret ?? '',
      },
    })

    if (!response.ok) {
      console.error(`[process-notifications] API returned ${response.status}: ${await response.text()}`)
    } else {
      console.log(`[process-notifications] Notification queue processed successfully`)
    }
  } catch (err) {
    console.error('[process-notifications] Failed to call notification API:', err)
  }
}

export const config: Config = {
  schedule: '*/5 * * * *',
}
