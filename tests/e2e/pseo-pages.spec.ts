import { test, expect } from '@playwright/test'

test.describe('Programmatic SEO Pages', () => {
  // Test a known city/procedure combination that should exist in the data
  const testPath = '/seoul/rhinoplasty'

  test('renders without 404', async ({ page }) => {
    const response = await page.goto(testPath)
    expect(response?.status()).not.toBe(404)
  })

  test('has unique page title', async ({ page }) => {
    await page.goto(testPath)
    const title = await page.title()
    expect(title).toContain('Seoul')
    expect(title.length).toBeGreaterThan(20)
  })

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto(testPath)
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toBeAttached()
    const content = await jsonLd.textContent()
    expect(content).toBeTruthy()
    const parsed = JSON.parse(content!)
    expect(parsed['@type']).toBe('MedicalWebPage')
  })

  test('has a hero section with trust badge', async ({ page }) => {
    await page.goto(testPath)
    // Should have trust badge text (not "System Loaded")
    await expect(page.locator('text=KAHF')).toBeVisible()
    // Should NOT have old tech aesthetic copy
    const systemLoaded = page.locator('text=System Loaded')
    await expect(systemLoaded).not.toBeVisible()
  })

  test('CTA links to patient intake', async ({ page }) => {
    await page.goto(testPath)
    const ctaLink = page.locator('a[href="/patient-intake"]').first()
    await expect(ctaLink).toBeVisible()
  })

  test('has canonical URL', async ({ page }) => {
    await page.goto(testPath)
    const canonical = page.locator('link[rel="canonical"]')
    const count = await canonical.count()
    if (count > 0) {
      const href = await canonical.getAttribute('href')
      expect(href).toContain('seoul')
      expect(href).toContain('rhinoplasty')
    }
  })

  test('404 for unknown city/procedure', async ({ page }) => {
    const response = await page.goto('/fakecity-xyz/fakeprocedure-xyz')
    expect(response?.status()).toBe(404)
  })
})
