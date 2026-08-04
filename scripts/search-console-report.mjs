import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_OUTPUT = path.resolve(".seo/search-console-report.json");

function getArg(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function usage() {
  console.log(`Usage:
  pnpm search-console:report --credentials /path/to/client.json

Options:
  --site <property>       Search Console property (default: auto-detect emojidir.com)
  --start <YYYY-MM-DD>    Start date (default: 365 days ending yesterday)
  --end <YYYY-MM-DD>      End date (default: yesterday)
  --output <path>         Report path (default: .seo/search-console-report.json)`);
}

function base64Url(value) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function defaultDateRange() {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  return { start: isoDate(start), end: isoDate(end) };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writePrivateJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(filePath, 0o600);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const message = body?.error?.message || body?.error_description || text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }
  return body;
}

function oauthConfig(credentials) {
  const config = credentials.installed || credentials.web;
  if (!config?.client_id || !config?.auth_uri || !config?.token_uri) {
    throw new Error("Unsupported OAuth client JSON: expected an installed or web client configuration.");
  }
  return config;
}

async function waitForAuthorization(config) {
  const state = base64Url(crypto.randomBytes(24));
  const verifier = base64Url(crypto.randomBytes(48));
  const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());

  const result = await new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestUrl = new URL(request.url, "http://localhost");
      if (requestUrl.pathname !== "/oauth2callback") {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      if (requestUrl.searchParams.get("state") !== state) {
        response.writeHead(400);
        response.end("Invalid OAuth state");
        server.close();
        reject(new Error("OAuth state validation failed."));
        return;
      }
      const error = requestUrl.searchParams.get("error");
      if (error) {
        response.writeHead(400);
        response.end(`Authorization failed: ${error}`);
        server.close();
        reject(new Error(`Google authorization failed: ${error}`));
        return;
      }
      const code = requestUrl.searchParams.get("code");
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end("<p>Authorization complete. You can close this tab.</p>");
      server.close();
      if (!port) {
        reject(new Error("OAuth callback server closed before returning its port."));
        return;
      }
      resolve({ code, verifier, redirectUri: `http://localhost:${port}/oauth2callback` });
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      if (!port) {
        server.close();
        reject(new Error("Could not start the local OAuth callback server."));
        return;
      }
      const redirectUri = `http://localhost:${port}/oauth2callback`;
      const authUrl = new URL(config.auth_uri);
      authUrl.search = new URLSearchParams({
        client_id: config.client_id,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SCOPE,
        access_type: "offline",
        prompt: "consent",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
      }).toString();
      console.log("Opening Google authorization in your browser...");
      console.log(authUrl.toString());
      execFile("open", [authUrl.toString()], () => {});
    });
  });

  return result;
}

async function exchangeCode(config, authorization) {
  const body = new URLSearchParams({
    code: authorization.code,
    client_id: config.client_id,
    redirect_uri: authorization.redirectUri,
    grant_type: "authorization_code",
    code_verifier: authorization.verifier,
  });
  if (config.client_secret) body.set("client_secret", config.client_secret);
  return requestJson(config.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
}

async function refreshToken(config, token) {
  const body = new URLSearchParams({
    refresh_token: token.refresh_token,
    client_id: config.client_id,
    grant_type: "refresh_token",
  });
  if (config.client_secret) body.set("client_secret", config.client_secret);
  const refreshed = await requestJson(config.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  return { ...token, ...refreshed, expiry_date: Date.now() + (refreshed.expires_in || 3600) * 1000 };
}

async function getAccessToken(config, tokenPath) {
  let token;
  try {
    token = await readJson(tokenPath);
  } catch {
    token = null;
  }

  if (token?.access_token && Number(token.expiry_date || 0) > Date.now() + 60_000) {
    return token.access_token;
  }
  if (token?.refresh_token) {
    const refreshed = await refreshToken(config, token);
    await writePrivateJson(tokenPath, refreshed);
    return refreshed.access_token;
  }

  const authorization = await waitForAuthorization(config);
  if (!authorization.code) throw new Error("Google did not return an authorization code.");
  const freshToken = await exchangeCode(config, authorization);
  if (!freshToken.refresh_token) {
    throw new Error("No refresh token returned. Remove the local token file and authorize again.");
  }
  freshToken.expiry_date = Date.now() + (freshToken.expires_in || 3600) * 1000;
  await writePrivateJson(tokenPath, freshToken);
  return freshToken.access_token;
}

async function apiRequest(accessToken, url, options = {}) {
  return requestJson(url, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
}

async function querySearchAnalytics(accessToken, siteUrl, startDate, endDate, dimensions) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  return apiRequest(accessToken, endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: 25_000, dataState: "final" }),
  });
}

function chooseSite(sites, requested) {
  if (requested) return sites.find((site) => site.siteUrl === requested);
  return sites.find((site) => site.siteUrl === "sc-domain:emojidir.com")
    || sites.find((site) => site.siteUrl === "https://emojidir.com/")
    || sites.find((site) => site.siteUrl.includes("emojidir.com"));
}

const credentialsPath = getArg("--credentials");
if (process.argv.includes("--help")) {
  usage();
  process.exit(0);
}
if (!credentialsPath) {
  usage();
  process.exit(1);
}

const range = defaultDateRange();
const startDate = getArg("--start", range.start);
const endDate = getArg("--end", range.end);
const outputPath = path.resolve(getArg("--output", DEFAULT_OUTPUT));
const tokenPath = path.join(path.dirname(outputPath), "search-console-token.json");

try {
  const credentials = await readJson(path.resolve(credentialsPath));
  const config = oauthConfig(credentials);
  const accessToken = await getAccessToken(config, tokenPath);
  const sitesResponse = await apiRequest(accessToken, "https://www.googleapis.com/webmasters/v3/sites");
  const sites = sitesResponse.siteEntry || [];
  const selectedSite = chooseSite(sites, getArg("--site"));

  if (!selectedSite) {
    await writePrivateJson(outputPath, { fetchedAt: new Date().toISOString(), sites });
    throw new Error("No emojidir.com property found. Add this Google account to the Search Console property and run again.");
  }

  console.log(`Using Search Console property: ${selectedSite.siteUrl}`);
  console.log(`Date range: ${startDate} to ${endDate}`);
  const report = {
    fetchedAt: new Date().toISOString(),
    siteUrl: selectedSite.siteUrl,
    permissionLevel: selectedSite.permissionLevel,
    startDate,
    endDate,
    sites,
    byDate: await querySearchAnalytics(accessToken, selectedSite.siteUrl, startDate, endDate, ["date"]),
    byPage: await querySearchAnalytics(accessToken, selectedSite.siteUrl, startDate, endDate, ["page"]),
    byQuery: await querySearchAnalytics(accessToken, selectedSite.siteUrl, startDate, endDate, ["query"]),
  };
  await writePrivateJson(outputPath, report);
  console.log(`Report written to ${outputPath}`);
} catch (error) {
  console.error(`Search Console report failed: ${error.message}`);
  process.exitCode = 1;
}
