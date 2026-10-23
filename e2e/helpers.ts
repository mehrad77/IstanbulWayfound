import { type APIRequestContext, type Browser, devices, expect, type Page } from "@playwright/test";

export const SITE = "http://localhost:4321";
export const CONSOLE = "http://localhost:5173";
export const PUBLIC = "http://localhost:8791";
export const API = "http://localhost:8790";

export async function signIn(
  page: Page,
  account: "cafe-owner" | "showroom-owner" | "clinic-owner" | "agency",
) {
  const res = await page.request.post(`${CONSOLE}/api/auth/demo`, { data: { account } });
  expect(res.ok()).toBeTruthy();
}

export async function agencyApi(request: APIRequestContext) {
  const res = await request.post(`${CONSOLE}/api/auth/demo`, { data: { account: "agency" } });
  expect(res.ok()).toBeTruthy();
  return request;
}

/** A phone: Pixel 7 viewport, touch and user agent. */
export async function phone(browser: Browser, locale = "en-GB") {
  const context = await browser.newContext({ ...devices["Pixel 7"], locale });
  return context.newPage();
}

export const unique = (prefix: string) => `${prefix} ${Date.now().toString(36)}`;
