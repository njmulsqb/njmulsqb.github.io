# Najam Ul Saqib — Technical Personal Site

This repository is a lightweight Jekyll site for Najam Ul Saqib, focused on security engineering, application security, cloud security, research, writing, and practical technical notes.

## Current structure

The site is intentionally minimal and markdown-first, with a monochrome aesthetic and very little front-end overhead.

- Home page serves as a technical landing page and index of recent writing.
- About page provides the professional and personal context for the work.
- Writing section hosts technical notes, investigations, and security-focused posts.
- Talks and training page lists public appearances, podcast interviews, and workshops.
- The site is optimized for simple browsing, low overhead, and mobile-friendly reading.

## Key files

- Site config: [_config.yml](_config.yml)
- Dependency setup: [Gemfile](Gemfile)
- Homepage: [index.md](index.md)
- About page: [pages/about.md](pages/about.md)
- Writing page: [pages/writing.md](pages/writing.md)
- Talks page: [pages/talks-and-training.md](pages/talks-and-training.md)
- Digital presence page: [pages/digital-presence.md](pages/digital-presence.md)
- Main layout: [_layouts/default.html](_layouts/default.html)
- Minimal styling: [assets/css/mono.css](assets/css/mono.css)
- Blog posts: [_posts/](_posts/)

## Local development

Install dependencies:

```bash
gem install bundler
bundle install
```

Build the site:

```bash
bundle exec jekyll build
```

Run the local preview server:

```bash
bundle exec jekyll serve
```

Optional: preview drafts:

```bash
bundle exec jekyll serve --drafts
```

## Notes

- The site uses Jekyll 4.4.1 in the project Gemfile.
- The permalink structure is configured around the writing route.
- The visual design avoids heavy marketing patterns and stays intentionally minimal.
- This is a technical personal site, not a generic portfolio or startup landing page.

## Publishing

This repo is designed to be published as a standard static Jekyll site. Build locally and deploy the generated output to any static hosting provider or Jekyll-compatible platform.
