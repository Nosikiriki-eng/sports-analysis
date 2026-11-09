export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.FOOTBALL_DATA_TOKEN) {
      return Response.json(
        { error: "Missing FOOTBALL_DATA_TOKEN" },
        { status: 500, headers: cors }
      );
    }

    const url = new URL(request.url);
    let apiUrl;

    if (url.pathname === "/competitions") {
      apiUrl = "https://api.football-data.org/v4/competitions";
    } else if (url.pathname === "/matches") {
      const from = url.searchParams.get("dateFrom");
      const to = url.searchParams.get("dateTo");

      if (!from || !to) {
        return Response.json(
          { error: "Date range required" },
          { status: 400, headers: cors }
        );
      }

      apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${from}&dateTo=${to}`;
    } else {
      return Response.json(
        { error: "Unknown endpoint" },
        { status: 404, headers: cors }
      );
    }

    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": env.FOOTBALL_DATA_TOKEN
      }
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      }
    });
  }
};
