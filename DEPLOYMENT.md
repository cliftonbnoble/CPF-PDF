# Deployment Guide for Cloudflare Pages

This guide will help you deploy the CHP 108A Inspector to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Code pushed to your repository

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Pages** in the left sidebar
   - Click **Create a project**
   - Click **Connect to Git**

3. **Configure Build Settings**
   - **Project name**: chp108a-inspector (or your preferred name)
   - **Production branch**: main
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)

4. **Environment Variables** (Optional)
   - No environment variables are required for this project
   - All processing happens client-side

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at: `https://chp108a-inspector.pages.dev`

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy out --project-name=chp108a-inspector
   ```

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to your Pages project in Cloudflare Dashboard
2. Click on **Custom domains**
3. Click **Set up a custom domain**
4. Follow the instructions to add your domain
5. Cloudflare will automatically provision SSL certificates

### Performance Optimization

The app is already optimized for Cloudflare Pages:
- ✅ Static export (no server-side rendering)
- ✅ All JavaScript bundles are optimized
- ✅ Automatic caching via `_headers` file
- ✅ Client-side PDF generation (no backend needed)

## Troubleshooting

### Build Fails

If the build fails, check:
1. Node.js version compatibility (requires Node 18+)
2. Make sure all dependencies are installed: `npm install --legacy-peer-deps`
3. Check build logs in Cloudflare Dashboard for specific errors

### PDF Generation Issues

The PDF generation happens entirely in the browser using `pdf-lib`. If PDFs aren't generating:
1. Check browser console for errors
2. Ensure signatures are captured before generating PDF
3. Try in a different browser (Chrome/Firefox/Safari)

### Site Not Loading

If the deployed site doesn't load:
1. Check the build output directory is set to `out`
2. Verify the build completed successfully
3. Check browser console for JavaScript errors
4. Clear browser cache and try again

## Local Testing

To test the production build locally:

```bash
# Build the static export
npm run build

# Preview the built site
npm run preview
```

Then open http://localhost:3000 in your browser.

## Automatic Deployments

Once connected to Git, Cloudflare Pages will automatically:
- Deploy on every push to your production branch (main)
- Create preview deployments for pull requests
- Run the build command and deploy the output

## Security

The app includes security headers via the `_headers` file:
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff (prevents MIME sniffing)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restricts geolocation, microphone, camera

## Cost

Cloudflare Pages free tier includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

This is more than sufficient for this application.

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
