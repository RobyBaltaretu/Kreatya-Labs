import { expect, test } from '@playwright/test';

test.describe('HU-04 · Calcular el ahorro', () => {
  test('muestra resultado, fórmula visible y permite pedir el informe', async ({ page }) => {
    await page.goto('/');
    const calc = page.locator('section[aria-labelledby="calc"]');
    await calc.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () =>
        document.querySelectorAll('section[aria-labelledby="calc"] astro-island[ssr]').length === 0,
    );
    await expect(calc.getByText('Ahorro anual estimado', { exact: true })).toBeVisible();
    await calc.getByText('Cómo lo calculamos').click();
    await expect(calc.getByText(/personas × .* h\/semana × 46 semanas/)).toBeVisible();
    await calc.getByLabel('Nombre').fill('Luis');
    await calc.getByLabel('Email').fill('luis@empresa.es');
    await calc.getByRole('button', { name: 'Recibir informe' }).click();
    await expect(calc.getByText(/Te enviaremos el informe/)).toBeVisible();
  });
});

test.describe('HU-05 · Solicitar diagnóstico', () => {
  test('5 pasos con progreso, validación en línea y reserva al final', async ({ page }) => {
    await page.goto('/diagnostico');
    const next = page.getByRole('button', { name: 'Siguiente →' });

    await next.click();
    await expect(page.getByRole('alert')).toContainText('Elige el sector');
    await page.getByLabel('Logística').check();
    await next.click();

    await expect(page.getByText('Paso 2 de 5')).toBeVisible();
    await page.getByLabel('Excel por todas partes').check();
    await next.click();
    await page.getByLabel('Excel / Google Sheets').check();
    await next.click();
    await page.getByLabel('10–49 empleados').check();
    await next.click();

    await expect(page.getByText('Paso 5 de 5')).toBeVisible();
    await page.getByLabel('Nombre *').fill('Marta');
    await page.getByLabel('Email de trabajo *').fill('marta-sin-arroba');
    await page.getByRole('button', { name: 'Enviar y reservar cita' }).click();
    await expect(page.getByText('Revisa el email')).toBeVisible();
    await page.getByLabel('Email de trabajo *').fill('marta@empresa.es');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Enviar y reservar cita' }).click();
    await expect(page.getByRole('heading', { name: /Gracias, Marta/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Elegir día y hora' })).toBeVisible();
  });

  test('precarga sector y tipo cuando se llega desde una ficha', async ({ page }) => {
    await page.goto('/proyectos/albaran-digital-transportes-levante');
    await page.getByRole('link', { name: 'Quiero algo parecido' }).first().click();
    await expect(page).toHaveURL(/diagnostico\?sector=logistica/);
    await expect(page.getByLabel('Logística')).toBeChecked();
  });
});

test.describe('HU-06 · Gestionar SEO desde el panel', () => {
  test('contador de caracteres y redirecciones', async ({ page }) => {
    await page.goto('http://localhost:4322/#/proyectos/prj_erp-fabricacion-metal');
    const title = page.getByLabel('Title');
    await title.fill(
      'Un título deliberadamente largo para superar los sesenta caracteres permitidos',
    );
    await expect(page.getByText(/demasiado largo/).first()).toBeVisible();

    await page.goto('http://localhost:4322/#/seo');
    await page.getByLabel('Ruta de origen').fill('/antigua');
    await page.getByLabel('Ruta de destino').fill('/proyectos');
    await page.getByRole('button', { name: 'Añadir' }).click();
    await expect(page.getByText('/antigua → /proyectos')).toBeVisible();
  });
});

test.describe('SEO técnico', () => {
  test('una sola H1, title ≤ 60, description ≤ 155 y canonical', async ({ page }) => {
    for (const path of [
      '/',
      '/proyectos',
      '/precios',
      '/sectores/logistica',
      '/soluciones/erp-a-medida',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).length).toBeLessThanOrEqual(60);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc?.length ?? 0).toBeLessThanOrEqual(155);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    }
  });

  test('el banner de cookies ofrece rechazar con la misma visibilidad', async ({ page }) => {
    await page.goto('/');
    const reject = page.getByRole('button', { name: 'Rechazar' });
    const accept = page.getByRole('button', { name: 'Aceptar' });
    await expect(reject).toBeVisible();
    expect(await reject.getAttribute('class')).toBe(await accept.getAttribute('class'));
    await reject.click();
    await expect(reject).toBeHidden();
  });
});
