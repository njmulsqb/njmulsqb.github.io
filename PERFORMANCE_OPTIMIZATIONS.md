# Performance Optimization Summary

## Optimizations Implemented

This document summarizes the performance optimizations made to improve PageSpeed Insights scores.

### 1. Render-Blocking Resources (Est. savings: 3,430 ms)

#### CSS Optimization

- **Critical CSS Loading**: Bootstrap, default.css, style.css, and responsive.css are loaded synchronously as they're needed for above-the-fold content
- **Non-Critical CSS Deferred**: FontAwesome (all.css), magnific-popup.css, slick.css, and slick-menu.css are loaded with `media="print" onload="this.media='all'"` to defer their loading
- **Fallback for No-JS**: Added `<noscript>` tags to ensure non-critical CSS still loads for users without JavaScript

#### JavaScript Optimization

- **Deferred Loading**: All JavaScript files except modernizr are loaded with the `defer` attribute
- **Modernizr Exception**: Kept synchronous as it's needed early for feature detection
- **Tailwind CDN**: Moved from blocking to deferred loading

#### Font Loading Optimization

- **Preconnect Hints**: Added for fonts.googleapis.com, fonts.gstatic.com, and cdn.jsdelivr.net
- **Google Fonts**:
  - Moved from CSS @import to HTML `<link>` tag
  - Added `font-display=swap` parameter
  - Uses CSS2 API with wght syntax for better performance
- **FontAwesome Fonts**: Changed all @font-face declarations from `font-display: auto` to `font-display: swap`

### 2. Font Display (Est. savings: 130 ms)

All fonts now use `font-display: swap` which ensures:

- Text remains visible during font loading (prevents FOIT - Flash of Invisible Text)
- Improves First Contentful Paint (FCP)
- Better user experience on slow connections

### 3. Cache Lifetimes

**Note**: GitHub Pages sets cache headers automatically. Current cache TTL is 10 minutes for most assets.

For better caching if migrating to Netlify or custom hosting:

- Static assets (CSS, JS, fonts, images): 1 year (31536000 seconds)
- HTML files: 1 hour (3600 seconds)

A `_headers` file has been created for Netlify deployment (see `_headers` file).

### 4. Network Dependency Optimization

- **Preconnect**: Added early connection hints to external domains
- **Resource Hints**: Helps browser establish connections earlier
- **Reduced Chain Length**: Optimized loading order to minimize dependency chains

## Expected Performance Improvements

### Before Optimization

- **Render-blocking time**: ~3,430 ms
- **Font display issues**: ~130 ms
- **Cache lifetime**: 10 minutes (GitHub Pages default)

### After Optimization

- **Render-blocking time**: Significantly reduced (critical CSS only)
- **Font display**: Optimized with swap
- **Better LCP**: Faster Largest Contentful Paint
- **Better FCP**: Faster First Contentful Paint

## Testing the Optimizations

1. **Local Testing**:

   ```bash
   bundle exec jekyll serve
   ```

   Visit http://localhost:4000 and check the Network tab in DevTools

2. **Production Testing**:

   - Deploy to GitHub Pages
   - Run PageSpeed Insights: https://pagespeed.web.dev/
   - Run Lighthouse in Chrome DevTools

3. **Key Metrics to Monitor**:
   - **FCP** (First Contentful Paint): Should improve
   - **LCP** (Largest Contentful Paint): Should improve
   - **TBT** (Total Blocking Time): Should decrease
   - **CLS** (Cumulative Layout Shift): Should remain low

## Further Optimizations (Optional)

### Image Optimization

- Convert images to WebP format
- Use responsive images with `srcset`
- Implement lazy loading for below-the-fold images

### Advanced Caching

- Migrate to Netlify or Cloudflare Pages for better cache control
- Implement service workers for offline support

### Code Splitting

- Consider removing unused CSS/JS
- Minify and compress assets further

### CDN Considerations

- Consider self-hosting Tailwind instead of using CDN
- Or remove Tailwind if not heavily used

## Files Modified

1. `_layouts/default.html` - Optimized resource loading
2. `assets/css/style.css` - Removed Google Fonts @import
3. `assets/css/all.css` - Updated font-display to swap
4. `_headers` - Created for Netlify deployment (optional)

## Deployment

Changes will automatically deploy via GitHub Actions when pushed to the main branch.

## Support

For questions or issues, refer to:

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
