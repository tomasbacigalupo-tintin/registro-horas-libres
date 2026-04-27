const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

function getGasUrl() {
  if (!GAS_URL) {
    return null;
  }
  return GAS_URL;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

async function forwardJsonResponse(response: Response, sourceUrl?: string) {
  const text = await response.text();
  
  // Log para debugging
  console.log(`[GAS Proxy] Status: ${response.status}, URL: ${sourceUrl}`);
  console.log(`[GAS Proxy] Response (first 200 chars): ${text.slice(0, 200)}`);
  
  // Try to parse as JSON
  try {
    const payload = JSON.parse(text);
    return jsonResponse(payload, response.status);
  } catch (parseError) {
    // If JSON parse fails, return error with more context
    return jsonResponse(
      {
        ok: false,
        error: 'Google Apps Script returned non-JSON response',
        status: response.status,
        url: sourceUrl,
        rawResponse: text.slice(0, 1000),
        hint: text.includes('<!doctype') ? 'HTML response detected - check GAS URL and permissions' : 'Unknown format'
      },
      response.status || 500
    );
  }
}

export async function GET(request: Request) {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return jsonResponse({ ok: false, error: 'Falta configurar GOOGLE_APPS_SCRIPT_URL' }, 500);
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(gasUrl);
  targetUrl.search = incomingUrl.searchParams.toString();

  console.log(`[GAS GET] Calling: ${targetUrl.toString()}`);

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });
    return await forwardJsonResponse(response, targetUrl.toString());
  } catch (error) {
    console.error(`[GAS GET] Error:`, error);
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}

export async function POST(request: Request) {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return jsonResponse({ ok: false, error: 'Falta configurar GOOGLE_APPS_SCRIPT_URL' }, 500);
  }

  console.log(`[GAS POST] Calling: ${gasUrl}`);

  try {
    const body = await request.json();
    console.log(`[GAS POST] Body:`, JSON.stringify(body).slice(0, 100));
    
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
      cache: 'no-store'
    });
    return await forwardJsonResponse(response, gasUrl);
  } catch (error) {
    console.error(`[GAS POST] Error:`, error);
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}
