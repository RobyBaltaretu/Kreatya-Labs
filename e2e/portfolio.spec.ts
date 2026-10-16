import { expect, type Page, test } from '@playwright/test';

/** Espera a que todas las islas de Astro estén hidratadas (las `client:visible` exigen hacer scroll). */
async function hydrate(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await page.waitForFunction(() => document.querySelectorAll('astro-island[ssr]').length === 0);
}

test.describe('HU-01 · Filtrar proyectos', () => {
  test('filtra por sector sin recargar y refleja el estado en la URL', async ({ page }) => {
    await page.goto('/proyectos');
    const cards = page.locator('[data-project]:visible');
    const total = await cards.count();
    expect(total).toBeGreaterThan(3);

    await page.locator('#f-sector').selectOption('logistica');
    await expect(page).toHaveURL(/sector=logistica/);
    await expect(cards).toHaveCount(2);

    await page.locator('#f-tipo').selectOption('app');
    await expect(page).toHaveURL(/sector=logistica&tipo=app/);
    await expect(cards).toHaveCount(1);

    await page.goBack();
    await expect(page).toHaveURL(/sector=logistica$/);
    await expect(cards).toHaveCount(2);
  });

  test('sin resultados muestra mensaje, sugerencias y CTA', async ({ page }) => {
    await page.goto('/proyectos?sector=salud&tipo=erp');
    await expect(
      page.getByText('Aún no tenemos un caso publicado con esa combinación.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cuéntanos tu caso' })).toHaveAttribute(
      'href',
      /sector=salud/,
    );
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('muestra el listado completo', async ({ page }) => {
      await page.goto('/proyectos');
      expect(await page.locator('[data-project]').count()).toBeGreaterThan(3);
    });
  });
});

test.describe('HU-02 · Ver un caso completo', () => {
  test('la ficha tiene los bloques de la plantilla y JSON-LD válido', async ({ page }) => {
    await page.goto('/proyectos/albaran-digital-transportes-levante');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Albarán digital y facturación el mismo día',
    );
    for (const h of [
      'El reto',
      'Antes y después del proceso',
      'La solución',
      'Capturas',
      'Resultados',
      'Prueba la solución',
      'Proyectos relacionados',
    ]) {
      await expect(page.getByRole('heading', { name: h, exact: true })).toBeVisible();
    }
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = ld.flatMap((t) => JSON.parse(t)['@type']);
    expect(types).toEqual(
      expect.arrayContaining(['CreativeWork', 'VideoObject', 'BreadcrumbList']),
    );
  });

  test('la galería abre un lightbox navegable con teclado', async ({ page }) => {
    await page.goto('/proyectos/albaran-digital-transportes-levante');
    await hydrate(page);
    await page
      .getByRole('button', { name: /Ampliar/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: 'Galería ampliada' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('1/3')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2/3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('los proyectos con NDA ocultan el nombre del cliente', async ({ page }) => {
    await page.goto('/proyectos/erp-fabricacion-metal');
    await expect(page.getByText('Cliente del sector industria').first()).toBeVisible();
  });
});

test.describe('HU-03 · Probar una vista previa', () => {
  test('el botón «Probar la demo» solo aparece con demo', async ({ page }) => {
    await page.goto('/proyectos/trazabilidad-cooperativa');
    await expect(page.getByRole('link', { name: 'Probar la demo' })).toHaveCount(0);
    await page.goto('/proyectos/albaran-digital-transportes-levante');
    await expect(page.getByRole('link', { name: 'Probar la demo' })).toBeVisible();
  });

  test('recorrido guiado con conmutador de dispositivo y banner fijo', async ({ page }) => {
    await page.goto('/proyectos/albaran-digital-transportes-levante/demo');
    await expect(page.getByText('Datos de demostración')).toBeVisible();
    await page.getByRole('button', { name: 'Móvil' }).click();
    await expect(page.getByRole('button', { name: 'Móvil' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'Siguiente →' }).click();
    await expect(page.getByText('Paso 2 / 3')).toBeVisible();
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  });

  test('demo bajo solicitud: formulario de 3 campos', async ({ page }) => {
    await page.goto('/proyectos/erp-fabricacion-metal');
    await hydrate(page);
    const form = page.locator('#demo form');
    await form.getByLabel('Nombre').fill('Ana Pérez');
    await form.getByLabel('Email').fill('ana@empresa.es');
    await form.getByLabel('Empresa').fill('Empresa S.L.');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: /Recibir acceso/ }).click();
    await expect(page.getByText('Revisa tu correo')).toBeVisible();
  });
});
