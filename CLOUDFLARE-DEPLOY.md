# Deploying the optimized campaign

The production domain is configured as **https://mamudajohn.com/** in `src/data/site.mjs`.

## Cloudflare Pages

Use the existing Pages project and custom domain:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 22.12 or later (the project is verified on Node 22.20).

For Git-connected Pages, publish the updated source through the existing production branch. For a direct-upload project, build locally and upload the **contents of `dist`**, including the `candidates` directories, `404.html`, `robots.txt`, `sitemap.xml`, and `_headers`.

The build now generates actual HTML for the homepage and every candidate profile. Keep the generated directories: do not replace all profile requests with the homepage. The included `404.html` lets Pages return a real missing-page response. The `_headers` file gives hashed JS/CSS long browser caching while keeping homepage and profile HTML revalidated.

If the Cloudflare application uses Workers Static Assets rather than Pages, deploy this same `dist` output through the existing Worker asset configuration. Do not create a second unrelated application or overwrite existing account settings.

Cloudflare reference: [React deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [serving static pages and 404s](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Google indexing after deployment

1. Confirm the live homepage and `/candidates/john-mamuda/` load publicly over HTTPS, without a Cloudflare Access login or a browser challenge for Googlebot.
2. Confirm `https://mamudajohn.com/robots.txt` and `https://mamudajohn.com/sitemap.xml` return their text/XML files.
3. Add `mamudajohn.com` to [Google Search Console](https://search.google.com/search-console/). Complete Google's domain ownership verification using the DNS record it gives you. No verification token is included in this repository.
4. Submit `https://mamudajohn.com/sitemap.xml` under Sitemaps.
5. Inspect the homepage and main candidate URL, run the live URL test, then request indexing.

Pages preview deployments can send `X-Robots-Tag: noindex`; verify the production custom domain. Identical copied candidate templates share the original candidate's canonical URL, and unconfigured slots are excluded from the sitemap. Real candidates with distinct content receive their own indexable URL.

Metadata and a sitemap help discovery; Google decides whether and when to index and rank a page. [Google's recrawling guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) explains the process and limits.

## Validation

```sh
npm test
npm run check:render
npm run build
```

The build includes production checks for HTML content, metadata, canonical links, sitemap, and keeping the WebGL bundle out of initial imports. Check the deployed site on an actual phone as well: local automated checks do not measure real-device frame rate or Cloudflare deployment behavior.
