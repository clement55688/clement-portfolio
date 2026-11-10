// Short link: https://dj-intake.a2040404.workers.dev
//   /          -> the DJ Intake page from the main site (address stays short)
//   /download  -> the official installer on GitHub (same asset as the site's Download buttons)
//   anything else -> the same path on the main site
// The main site is reached through the SITE service binding; a plain fetch between
// two workers.dev Workers on the same account is blocked by Cloudflare.

const SITE = "https://clement-portfolio.a2040404.workers.dev";
const DOWNLOAD = "https://github.com/clement55688/dj-intake-app/releases/latest/download/DJ-Intake-macOS-installer.zip";
// Files the DJ Intake page needs (scripts, styles, images), served through the binding.
const PAGE_FILES = [/^\/_next\//, /^\/projects\//, /^\/favicon\.ico$/, /^\/opengraph-image/, /^\/tools\/dj-intake\/?$/];

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/download") return Response.redirect(DOWNLOAD, 302);
    if (url.pathname === "/" || PAGE_FILES.some((pattern) => pattern.test(url.pathname))) {
      const target = new URL(url.pathname === "/" ? "/tools/dj-intake" : url.pathname, SITE);
      target.search = url.search;
      return env.SITE.fetch(new Request(target, request));
    }
    // Next.js preloads and client-side navigations fetch page data in the background;
    // serve those here too, since a cross-site redirect would be blocked by the browser.
    if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
      return env.SITE.fetch(new Request(new URL(url.pathname + url.search, SITE), request));
    }
    return Response.redirect(SITE + url.pathname + url.search, 302);
  },
};

export default worker;
