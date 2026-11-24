const http = require("node:http");

const PORT = Number(process.env.PORT || 3000);
const WARERA_API = "https://api2.warera.io/trpc/";

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(body));
}

function safeProcedure(value) {
  return typeof value === "string" &&
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(value);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, { ok: true, service: "warera-assistant" });
  }

  if (url.pathname !== "/api/warera" || req.method !== "GET") {
    return send(res, 404, { error: "Not found" });
  }

  const accessToken = process.env.ASSISTANT_ACCESS_TOKEN;
  const apiKey = process.env.WARERA_API_KEY;

  if (!accessToken || !apiKey) {
    return send(res, 503, { error: "Service configuration is incomplete" });
  }

  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${accessToken}`) {
    return send(res, 401, { error: "Unauthorized" });
  }

  const procedure = url.searchParams.get("procedure");
  if (!safeProcedure(procedure)) {
    return send(res, 400, { error: "A valid read-only procedure name is required" });
  }

  let input = {};
  const rawInput = url.searchParams.get("input");
  if (rawInput) {
    try {
      input = JSON.parse(rawInput);
    } catch {
      return send(res, 400, { error: "Input must be valid JSON" });
    }
  }

  try {
    const target = new URL(encodeURIComponent(procedure), WARERA_API);
    target.searchParams.set("input", JSON.stringify({ json: input }));

    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "accept": "application/json"
      },
      signal: AbortSignal.timeout(15000)
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: "War Era API returned a non-JSON response" };
    }

    return send(res, upstream.ok ? 200 : upstream.status, {
      ok: upstream.ok,
      procedure,
      data
    });
  } catch {
    return send(res, 502, { error: "Could not reach the War Era API" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`War Era assistant listening on port ${PORT}`);
});
