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

async function forwardJsonResponse(response: Response) {
  const text = await response.text();
  
  // Try to parse as JSON
  try {
    const payload = JSON.parse(text);
    return jsonResponse(payload, response.status);
  } catch (parseError) {
    // If JSON parse fails, return error with raw response
    return jsonResponse(
      {
        ok: false,
        error: 'Google Apps Script returned non-JSON response',
        status: response.status,
        raw: text.slice(0, 500)
      },
      response.status
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

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });
    return await forwardJsonResponse(response);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}

export async function POST(request: Request) {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return jsonResponse({ ok: false, error: 'Falta configurar GOOGLE_APPS_SCRIPT_URL' }, 500);
  }

  try {
    const body = await request.json();
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
      cache: 'no-store'
    });
    return await forwardJsonResponse(response);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}
