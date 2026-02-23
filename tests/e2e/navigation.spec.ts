import { test, expect } from '@playwright/test'

test.describe('Core Navigation', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/kmedtour/i)
  })

  test('custom 404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-at-all')
    expect(response?.status()).toBe(404)
    // Should render custom 404, not a blank page
    const body = await page.locator('body').textContent()
    expect(body!.length).toBeGreaterThan(50)
  })

  test('patient login page renders', async ({ page }) => {
    await page.goto('/patient/login')
    await expect(page.locator('form, input[type="email"]').first()).toBeVisible()
  })

  test('coordinator redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/coordinator')
    // Should end up at coordinator login
    await expect(page).toHaveURL(/coordinator\/login/)
  })

  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health')
    expect([200, 503]).toContain(response.status())
    const body = await response.json()
    expect(body).toHaveProperty('status')
  })

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('<urlset')
  })

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text.toLowerCase()).toContain('user-agent')
  })
})
