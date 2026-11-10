
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

    // TheSportsDB – nogomet po datumu i ligi
    if (url.pathname === "/sportsdb") {
      const date = url.searchParams.get("date");
      const league = url.searchParams.get("league");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return Response.json(
          { error: "Valid date required: YYYY-MM-DD" },
          { status: 400, headers: cors }
        );
      }

      const params = new URLSearchParams({
        d: date,
        s: "Soccer"
      });

      if (league) {
        params.set("l", league);
      }

      const apiUrl =
        "https://www.thesportsdb.com/api/v1/json/123/eventsday.php?" +
        params.toString();

      const response = await fetch(apiUrl);

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          ...cors,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    // Football-Data API
    if (!env.FOOTBALL_DATA_TOKEN) {
      return Response.json(
        { error: "Missing FOOTBALL_DATA_TOKEN" },
        { status: 500, headers: cors }
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
          { error: "Date range required" },
          { status: 400, headers: cors }
        );
      }

      apiUrl =
        "https://api.football-data.org/v4/matches?dateFrom=" +
        encodeURIComponent(from) +
        "&dateTo=" +
        encodeURIComponent(to);

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
