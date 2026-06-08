# ChibiDrop

A Next.js application that generates and displays cute chibi-style artwork using AI. Features daily automated generation, animated versions, and a public gallery.

## Features

- 🎨 **AI-Generated Chibi Art**: Daily automated generation of chibi-style images
- 🎬 **Animated Versions**: Optional animation using Fal.ai
- 🗳️ **Public Gallery**: Browse, search, and filter generated artwork
- 💡 **Proposal System**: Users can suggest themes for future generations
- 🔒 **Anonymous & Secure**: Turnstile verification, rate limiting, content moderation
- 📱 **Responsive Design**: Works on all devices with dark mode support
- ⚡ **Edge Optimized**: Built with Next.js 16, deployed on Vercel

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI Providers**:
  - OpenAI (text + image generation)
  - Fal.ai (animation)
- **Authentication**: Cloudflare Turnstile (anonymous verification)
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel (with cron jobs)

## Prerequisites

- Node.js 20+ and pnpm
- Neon Postgres database
- Cloudflare R2 bucket
- OpenAI API key
- Fal.ai API key
- Upstash Redis database
- Cloudflare Turnstile site key

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Database
DATABASE_URL="postgres://..."

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_TEXT_MODEL="gpt-5.4-mini"
OPENAI_IMAGE_MODEL="gpt-image-1"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="chibidrop"
R2_PUBLIC_BASE_URL="https://..."

# Fal.ai
FAL_KEY="..."
FAL_ANIMATION_ENDPOINT="fal-ai/kling-video/v1.6/standard/image-to-video"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY="..."
NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."

# Cron
CRON_SECRET="your-secret-key"

# Optional
ANIMATE_PER_BATCH="2"
NEXT_PUBLIC_SITE_URL="https://chibidrop.com"
```

### Environment Variable Details

- **DATABASE_URL**: Neon Postgres connection string (use pooled connection for serverless)
- **OPENAI_API_KEY**: From [platform.openai.com](https://platform.openai.com)
- **R2\_\***: Create a bucket in Cloudflare dashboard, generate API tokens with R2 permissions
- **R2_PUBLIC_BASE_URL**: Custom domain or `https://<account-id>.r2.cloudflarestorage.com/<bucket>`
- **FAL_KEY**: From [fal.ai/dashboard](https://fal.ai/dashboard)
- **UPSTASH\_\***: Create Redis database at [upstash.com](https://upstash.com)
- **TURNSTILE\_\***: Create site at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
- **CRON_SECRET**: Random string for authenticating Vercel cron jobs

## Local Development

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Set up database**:

   ```bash
   pnpm db:push
   ```

4. **Start development server**:

   ```bash
   pnpm dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm verify           # Run typecheck + lint + format check
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint
pnpm format           # Format with Prettier

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Apply schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

## Project Structure

```
chibi-spark/
├── app/
│   ├── (public)/           # Public pages
│   │   ├── page.tsx        # Home page
│   │   ├── about/          # About page
│   │   ├── gallery/        # Gallery + detail pages
│   │   └── propose/        # Proposal form
│   ├── api/
│   │   └── cron/           # Cron job endpoints
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── chibi/              # Chibi-specific components
│   ├── gallery/            # Gallery components
│   ├── proposals/          # Proposal form
│   ├── site/               # Site shell (header, footer, etc.)
│   └── ui/                 # shadcn/ui components
├── features/
│   ├── gallery/            # Gallery queries
│   └── proposals/          # Proposal actions
├── lib/
│   ├── ai/                 # AI provider interfaces
│   │   ├── text/           # Text generation (OpenAI)
│   │   ├── image/          # Image generation (OpenAI)
│   │   └── animation/      # Animation (Fal.ai)
│   ├── db/                 # Database
│   │   ├── schema.ts       # Drizzle schema
│   │   └── queries/        # Query helpers
│   ├── storage/            # R2 storage service
│   ├── rate-limit/         # Upstash rate limiting
│   ├── turnstile/          # Turnstile verification
│   ├── moderation/         # Content moderation
│   └── validators/         # Zod schemas
├── server/
│   └── pipeline/           # Daily generation pipeline
├── drizzle/                # Database migrations
└── vercel.json             # Vercel cron configuration
```

## Deployment

### 1. Deploy to Vercel

1. Push your repository to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables (copy all from `.env.example`)
4. Deploy

### 2. Set Up Cron Jobs

The `vercel.json` file configures two cron jobs:

- **Daily drop**: Runs at 9 AM UTC (`0 9 * * *`)
- **Animation tick**: Runs every 10 minutes (`*/10 * * * *`)

These are automatically configured when you deploy to Vercel.

### 3. Configure Services

#### Neon Postgres

1. Create database at [console.neon.tech](https://console.neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Run `pnpm db:push` to create tables

#### Cloudflare R2

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with "Object Read & Write" permissions
3. Configure public access:
   - Option A: Custom domain (recommended)
   - Option B: Use `https://<account-id>.r2.cloudflarestorage.com/<bucket>`
4. Update `next.config.ts` with your domain in `images.remotePatterns`

#### OpenAI

1. Create API key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Add billing information
3. Copy key to `OPENAI_API_KEY`

#### Fal.ai

1. Create account at [fal.ai](https://fal.ai)
2. Generate API key in dashboard
3. Copy key to `FAL_KEY`

#### Upstash Redis

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy REST URL and token to environment variables

#### Cloudflare Turnstile

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Create new site
3. Choose "Managed" mode
4. Add your domain(s)
5. Copy site key and secret key to environment variables

## How It Works

### Daily Pipeline (9 AM UTC)

1. **Idempotency check**: Skip if today's batch already exists
2. **Theme selection**: Pick 4 themes from curated list + user proposals
3. **For each theme**:
   - Expand prompt using GPT-5.4-mini
   - Generate metadata (title, description, tags)
   - Generate image using gpt-image-1
   - Upload to R2
   - Create database records
   - Queue animation job (if within quota)
4. **Mark batch complete**

### Animation Worker (Every 10 min)

1. Query queued animation jobs
2. For each job:
   - Call Fal.ai with image URL
   - Wait for completion (poll every 3s, 3min timeout)
   - Download video, upload to R2
   - Create asset record
   - Update chibi item
3. Retry failed jobs up to 3 times

### Proposal Flow

1. User submits form with Turnstile verification
2. Server validates input (Zod)
3. Check rate limit (5/hour, 20/day per IP)
4. Moderate content with GPT (safe/borderline/unsafe)
5. Create proposal in database
6. Proposals marked "safe" are eligible for daily generation

## Database Schema

7 tables:

- `proposals`: User-submitted theme ideas
- `daily_batches`: One per day, tracks generation status
- `chibi_items`: Generated chibi artwork
- `chibi_assets`: Images, animations, thumbnails
- `chibi_tags`: Tag dictionary
- `chibi_item_tags`: Many-to-many relationship
- `generation_jobs`: Async job tracking

See `lib/db/schema.ts` for full schema definition.

## Development Notes

- **Lazy DB initialization**: Database client only connects on first query, allowing builds without `DATABASE_URL`
- **Provider abstractions**: All AI providers use interfaces, making it easy to swap implementations
- **Structured logging**: JSON logs with context propagation for debugging
- **Type safety**: Strict TypeScript with `noUncheckedIndexedAccess`
- **Edge-compatible**: OG image generation runs on edge runtime

## Troubleshooting

### Build fails with "Missing required env var: DATABASE_URL"

- This is expected if you don't have a database configured
- The app uses lazy initialization, so builds work without DB
- Set up Neon and add `DATABASE_URL` to `.env.local`

### Images not loading

- Check `R2_PUBLIC_BASE_URL` is correct
- Verify bucket has public read access
- Ensure domain is in `next.config.ts` `images.remotePatterns`

### Animations not generating

- Check `FAL_KEY` is set correctly
- Verify `FAL_ANIMATION_ENDPOINT` is valid
- Check `generation_jobs` table for failed jobs and error messages

### Rate limiting not working

- Verify Upstash Redis credentials
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Rate limiting is skipped if credentials are missing

### Cron jobs not running

- Verify `CRON_SECRET` is set in Vercel environment
- Check Vercel dashboard → Settings → Crons
- Cron jobs require Vercel Hobby plan or higher

## License

MIT

## Contributing

This is a personal project, but feel free to fork and modify for your own use!
