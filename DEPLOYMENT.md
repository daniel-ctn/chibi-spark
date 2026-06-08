# Deployment Guide

This guide walks you through deploying ChibiDrop to production with all required services.

## Prerequisites

- GitHub account
- Vercel account (Hobby plan or higher for cron jobs)
- Neon account (free tier available)
- Cloudflare account (free tier available)
- OpenAI account with billing configured
- Fal.ai account with credits
- Upstash account (free tier available)

## Step 1: Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git remote add origin https://github.com/yourusername/chibi-spark.git
   git push -u origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Choose "Next.js" as framework preset
   - Click "Deploy" (we'll configure env vars next)

3. **Note your deployment URL**
   - After deployment, copy your production URL (e.g., `https://chibi-spark.vercel.app`)
   - You'll need this for Turnstile and other services

## Step 2: Set Up Neon Postgres

1. **Create database**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Click "New Project"
   - Choose region closest to your users
   - Name it "chibidrop"

2. **Get connection string**
   - Click on your project
   - Go to "Connection Details"
   - Copy the "Transaction" pooler connection string
   - It should look like: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

3. **Add to Vercel**
   - In Vercel dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with the connection string
   - Select "Production", "Preview", and "Development"

4. **Initialize database**
   ```bash
   # Locally with DATABASE_URL set in .env.local
   pnpm db:push
   ```

## Step 3: Configure Cloudflare R2

1. **Create R2 bucket**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to R2 → Create bucket
   - Name it "chibidrop"
   - Choose region (usually "APAC" or "ENAM" for best performance)

2. **Enable public access**
   - Click on your bucket
   - Go to "Settings"
   - Under "Public access", click "Allow public access"
   - Choose either:
     - **Custom domain** (recommended): Add your domain and configure DNS
     - **R2.dev subdomain**: Use the provided `*.r2.dev` URL

3. **Create API token**
   - Go to "My Profile" → "API Tokens"
   - Click "Create Token"
   - Use template "Object Read & Write"
   - Permissions: `R2:Edit` for your bucket
   - Copy the Access Key ID and Secret Access Key
   - Also note your Account ID (top-right of dashboard)

4. **Add to Vercel**
   - `R2_ACCOUNT_ID`: Your Cloudflare account ID
   - `R2_ACCESS_KEY_ID`: From API token
   - `R2_SECRET_ACCESS_KEY`: From API token
   - `R2_BUCKET_NAME`: "chibidrop"
   - `R2_PUBLIC_BASE_URL`: Your public URL (custom domain or r2.dev URL)

5. **Update next.config.ts**
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'your-domain.com', // or *.r2.dev
       },
     ],
   }
   ```

## Step 4: Configure OpenAI

1. **Create API key**
   - Go to [platform.openai.com](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Name it "chibidrop"
   - Copy the key (starts with `sk-`)

2. **Add billing**
   - Go to "Billing" → "Add payment method"
   - Add credits (minimum $5 recommended)
   - Set usage limits if desired

3. **Add to Vercel**
   - `OPENAI_API_KEY`: Your secret key
   - `OPENAI_TEXT_MODEL`: "gpt-5.4-mini" (or your preferred model)
   - `OPENAI_IMAGE_MODEL`: "gpt-image-1" (or your preferred model)

## Step 5: Configure Fal.ai

1. **Create account**
   - Go to [fal.ai](https://fal.ai)
   - Sign up and add credits

2. **Generate API key**
   - Go to Dashboard → API Keys
   - Click "Add Key"
   - Copy the key

3. **Add to Vercel**
   - `FAL_KEY`: Your API key
   - `FAL_ANIMATION_ENDPOINT`: "fal-ai/kling-video/v1.6/standard/image-to-video"

## Step 6: Configure Upstash Redis

1. **Create Redis database**
   - Go to [upstash.com](https://upstash.com)
   - Click "Create Database"
   - Choose region closest to your Vercel deployment
   - Name it "chibidrop"

2. **Get credentials**
   - Click on your database
   - Copy "REST URL" and "REST Token"

3. **Add to Vercel**
   - `UPSTASH_REDIS_REST_URL`: The REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: The REST token

## Step 7: Configure Cloudflare Turnstile

1. **Create Turnstile site**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
   - Click "Add site"
   - Name it "ChibiDrop"
   - Choose "Managed" mode
   - Add your domains:
     - `localhost` (for development)
     - `*.vercel.app` (for preview deployments)
     - Your production domain (if using custom domain)

2. **Get keys**
   - Copy "Site Key" and "Secret Key"

3. **Add to Vercel**
   - `TURNSTILE_SECRET_KEY`: The secret key
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: The site key

## Step 8: Configure Cron Jobs

1. **Generate CRON_SECRET**

   ```bash
   openssl rand -hex 32
   ```

2. **Add to Vercel**
   - `CRON_SECRET`: The generated secret

3. **Verify cron configuration**
   - The `vercel.json` file already defines:
     - Daily drop: `0 9 * * *` (9 AM UTC daily)
     - Animation tick: `*/10 * * * *` (every 10 minutes)
   - These are automatically configured by Vercel

## Step 9: Redeploy

After adding all environment variables:

1. Go to Vercel dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "⋮" → "Redeploy"
4. Wait for deployment to complete

## Step 10: Test the Deployment

1. **Visit your site**
   - Go to your Vercel URL
   - Check home page loads
   - Navigate to gallery, about, propose pages

2. **Test proposal submission**
   - Go to /propose
   - Fill out the form
   - Complete Turnstile verification
   - Submit and verify success message

3. **Trigger manual daily drop** (optional)

   ```bash
   curl -X POST https://your-domain.com/api/cron/daily-drop \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Check database**
   - Use Drizzle Studio: `pnpm db:studio`
   - Or query directly: `SELECT * FROM chibi_items LIMIT 10;`

## Custom Domain (Optional)

1. **Add domain in Vercel**
   - Go to Project → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Update Turnstile**
   - Add your custom domain to the Turnstile site

3. **Update R2** (if using custom domain for images)
   - Configure custom domain in R2 bucket settings
   - Update `R2_PUBLIC_BASE_URL`
   - Update `next.config.ts` remote patterns

## Monitoring

### Vercel Analytics

- Enable Vercel Analytics in Project → Settings → Analytics
- View real-time traffic and performance metrics

### Database Monitoring

- Neon dashboard shows query performance and connection stats
- Use Drizzle Studio for data inspection

### Error Tracking

- Check Vercel Functions logs for errors
- Monitor `generation_jobs` table for failed jobs
- Set up alerts for failed cron jobs (optional)

## Scaling Considerations

### Database

- Neon free tier: 0.5 GB storage, 190 compute hours/month
- Upgrade to paid plan if you exceed limits
- Consider read replicas for high traffic

### Storage

- R2 free tier: 10 GB storage, 10M reads/month
- Very generous free tier, unlikely to hit limits
- Enable caching headers for better performance

### AI Costs

- OpenAI: ~$0.02-0.04 per image (gpt-image-1)
- Fal.ai: ~$0.05-0.10 per animation
- Daily cost: ~$0.10-0.20 (4 images + 2 animations)
- Monthly cost: ~$3-6

### Rate Limiting

- Current limits: 5 proposals/hour, 20/day per IP
- Adjust in `lib/rate-limit/index.ts` if needed
- Monitor Upstash dashboard for usage

## Troubleshooting

### Cron jobs not running

- Verify `CRON_SECRET` is set correctly
- Check Vercel dashboard → Settings → Crons
- Ensure you're on Hobby plan or higher

### Images not loading

- Verify `R2_PUBLIC_BASE_URL` is correct
- Check bucket has public read access
- Ensure domain is in `next.config.ts`

### Animations failing

- Check `generation_jobs` table for error messages
- Verify Fal.ai account has credits
- Check Fal.ai dashboard for job status

### Build failures

- Run `pnpm verify` locally to catch issues
- Check Vercel build logs for specific errors
- Ensure all environment variables are set

### Database connection issues

- Use pooled connection string (not direct)
- Check Neon dashboard for connection limits
- Verify `DATABASE_URL` is correct

## Maintenance

### Regular Tasks

- Monitor AI costs weekly
- Check failed jobs in `generation_jobs` table
- Review user proposals and mark unsafe ones as rejected
- Update curated themes monthly

### Updates

- Keep dependencies updated: `pnpm update`
- Monitor Next.js release notes for breaking changes
- Test updates in preview deployments first

### Backups

- Neon provides automatic backups (7 days on free tier)
- R2 objects are durable but consider cross-region replication
- Export important data periodically

## Support

For issues specific to this project:

- Check the troubleshooting section in README.md
- Review error logs in Vercel dashboard
- Inspect database with Drizzle Studio

For service-specific issues:

- Vercel: [vercel.com/help](https://vercel.com/help)
- Neon: [neon.tech/docs](https://neon.tech/docs)
- Cloudflare: [developers.cloudflare.com](https://developers.cloudflare.com)
- OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)
- Fal.ai: [fal.ai/docs](https://fal.ai/docs)
- Upstash: [upstash.com/docs](https://upstash.com/docs)
