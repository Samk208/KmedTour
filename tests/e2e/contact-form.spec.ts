import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('renders the contact form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/message/i)).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /send|submit/i }).click()
    // At least one validation error should be visible
    await expect(page.locator('[aria-invalid="true"], [data-invalid]').first()).toBeVisible({ timeout: 5000 })
  })

  test('page has no critical accessibility violations', async ({ page }) => {
    // Check basic a11y: form controls have labels
    const inputs = page.locator('input:not([type=hidden]), textarea')
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const labelCount = await label.count()
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        // Each input should have a label or aria-label
        expect(labelCount > 0 || !!ariaLabel || !!ariaLabelledBy).toBe(true)
      }
    }
  })
})
