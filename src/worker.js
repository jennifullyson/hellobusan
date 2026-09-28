export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "hellobusan.thesonlab.com" && url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/hellobusan.html", url), request));
    }

    return env.ASSETS.fetch(request);
  },
};
