import { test, expect } from '@playwright/test'

test.describe('Patient Intake Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patient-intake')
  })

  test('page renders intake form', async ({ page }) => {
    // The form should be visible on the page
    await expect(page.locator('form, [data-testid="intake-form"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('page title is meaningful', async ({ page }) => {
    const title = await page.title()
    expect(title.length).toBeGreaterThan(10)
  })

  test('has a submit/next button', async ({ page }) => {
    const btn = page.getByRole('button', { name: /next|continue|submit|start/i }).first()
    await expect(btn).toBeVisible()
  })

  test('shows validation on empty first step submit', async ({ page }) => {
    const btn = page.getByRole('button', { name: /next|continue|submit/i }).first()
    await btn.click()
    // At least one error or required hint should appear
    const errors = page.locator('[aria-invalid="true"], .text-red-500, .text-destructive, [data-error]')
    const errCount = await errors.count()
    expect(errCount).toBeGreaterThan(0)
  })
})
