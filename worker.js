
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const headers = {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120"
    };

    // API-FOOTBALL: LIGE
    if (url.pathname === "/football/leagues") {
      if (!env.API_FOOTBALL_KEY) {
        return Response.json(
          { error: "Nedostaje API_FOOTBALL_KEY u Cloudflareu" },
          { status: 500, headers }
        );
      }

      const params = new URLSearchParams();
      const country = url.searchParams.get("country");
      const season = url.searchParams.get("season") || String(new Date().getUTCFullYear());

      if (country) params.set("country", country);
      params.set("season", season);

      const response = await fetch(
        "https://v3.football.api-sports.io/leagues?" + params.toString(),
        { headers: { "x-apisports-key": env.API_FOOTBALL_KEY } }
      );

      return new Response(await response.text(), {
        status: response.status,
        headers
      });
    }

    // API-FOOTBALL: UTAKMICE
    if (url.pathname === "/football/fixtures") {
      if (!env.API_FOOTBALL_KEY) {
        return Response.json(
          { error: "Nedostaje API_FOOTBALL_KEY u Cloudflareu" },
          { status: 500, headers }
        );
      }

      const date = url.searchParams.get("date");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return Response.json(
          { error: "Datum mora biti YYYY-MM-DD" },
          { status: 400, headers }
        );
      }

      const params = new URLSearchParams({
        date: date,
        timezone: "Europe/Zagreb"
      });

      const league = url.searchParams.get("league");
      const season = url.searchParams.get("season") || date.slice(0, 4);

      if (league) params.set("league", league);
      params.set("season", season);

      const response = await fetch(
        "https://v3.football.api-sports.io/fixtures?" + params.toString(),
        { headers: { "x-apisports-key": env.API_FOOTBALL_KEY } }
      );

      return new Response(await response.text(), {
        status: response.status,
        headers
      });
    }

    // STARI THE SPORTSDb IZVOR – privremeno ostaje dostupan
    if (url.pathname === "/sportsdb") {
      const date = url.searchParams.get("date");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return Response.json(
          { error: "Neispravan datum" },
          { status: 400, headers }
        );
      }

      const params = new URLSearchParams({
        d: date,
        s: "Soccer"
      });

      const response = await fetch(
        "https://www.thesportsdb.com/api/v1/json/123/eventsday.php?" + params.toString()
      );

      return new Response(await response.text(), {
        status: response.status,
        headers
      });
    }

    // STARI FOOTBALL-DATA.ORG IZVOR
    if (!env.FOOTBALL_DATA_TOKEN) {
      return Response.json(
        { error: "Nedostaje FOOTBALL_DATA_TOKEN" },
        { status: 500, headers }
      );
    }

    let apiUrl;

    if (url.pathname === "/competitions") {
      apiUrl = "https://api.football-data.org/v4/competitions";
    } else if (url.pathname === "/matches") {
      const from = url.searchParams.get("dateFrom");
      const to = url.searchParams.get("dateTo");

      if (!from || !to) {
        return Response.json(
          { error: "Nedostaje raspon datuma" },
          { status: 400, headers }
        );
      }

      apiUrl =
        "https://api.football-data.org/v4/matches?dateFrom=" +
        encodeURIComponent(from) +
        "&dateTo=" +
        encodeURIComponent(to);
    } else {
      return Response.json(
        { error: "Nepoznata adresa" },
        { status: 404, headers }
      );
    }

    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": env.FOOTBALL_DATA_TOKEN
      }
    });

    return new Response(await response.text(), {
      status: response.status,
      headers
    });
  }
};
