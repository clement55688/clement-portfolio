type CfRequest = Request & { cf?: { colo?: string } };

function regionFrom(request: Request) {
  const colo = (request as CfRequest).cf?.colo;
  if (typeof colo === "string" && colo) return colo;
  const ray = request.headers.get("cf-ray");
  return ray?.match(/-([A-Za-z]{3})$/)?.[1] ?? "local";
}

function buildId() {
  const sha = process.env.GIT_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA;
  return sha?.slice(0, 7) || "local";
}

export function GET(request: Request) {
  return Response.json({
    status: "operational",
    build: buildId(),
    region: regionFrom(request),
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || "development",
  });
}
