# Najam Ul Saqib — Personal Jekyll Site

This repository is a Jekyll-based personal website for Najam Ul Saqib.

## Quick overview

- Static site generated with Jekyll (see `_config.yml`).
- Content: posts in `_posts/`, layouts in `_layouts/`, includes in `_includes/`, data in `_data/`, assets in `assets/`.
- Built site output: `_site/` (generated files).

## Prerequisites

- Ruby (2.7+ recommended)
- Bundler

## Install dependencies

```bash
gem install bundler
bundle install
```

## Build and serve

Build the site:

```bash
bundle exec jekyll build
```

Serve locally (dev server):

```bash
bundle exec jekyll serve
# or to include drafts:
bundle exec jekyll serve --drafts
```

## Notes

- The site uses `jekyll ~> 4.3.4` and `minima ~> 2.5` (see `Gemfile`).
- Plugins used: `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-archives`, `jekyll-tagging`.
- If you plan to host on GitHub Pages, consider switching to the `github-pages` gem or building locally and pushing the `_site/` contents to the `gh-pages` branch.

## Useful files

- Configuration: `_config.yml`
- Posts: `_posts/`
- Layouts: `_layouts/`
- Includes/partials: `_includes/`

If you want, I can add a short CONTRIBUTING or DEVELOPMENT section next.
