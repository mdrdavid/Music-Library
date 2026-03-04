# Audio Music Upload & Listening Platform

A modern web application for uploading and streaming your personal music collection. Built with Next.js, React, and Supabase.

## Features

- **Browse Music Library**: View all uploaded songs with metadata (title, artist)
- **Audio Player**: Play/pause controls, seek bar, volume control, time display
- **Upload Management**: Add new songs with password protection
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching capability

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage for MP3 files
- **UI Components**: shadcn/ui with Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account with:
  - PostgreSQL database
  - Storage bucket named `music`
  - Service role key for admin operations

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPLOAD_PASSWORD=your_secure_password
```

### Installation

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

## Database Schema

The `songs` table structure:

```sql
- id: UUID (primary key)
- title: VARCHAR (song name)
- artist: VARCHAR (artist name)
- storage_path: VARCHAR (file path in storage)
- public_url: VARCHAR (signed URL for playback)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Usage

### Browsing Songs

1. Visit the home page to see all uploaded songs
2. Click on any song card to start playing
3. Use the player controls to play/pause, seek, and adjust volume

### Uploading Songs

1. Click "Upload New Song" on the home page
2. Select an MP3 file (max 50MB)
3. Add song title and artist (optional, defaults to filename)
4. Enter the upload password
5. Click "Upload Song"

**Note**: Only MP3 files are supported. The upload password is required for security.

## API Routes

- `GET /api/songs` - Fetch all songs
- `POST /api/upload` - Upload a new song (requires password)

## Security

- Password-protected uploads prevent unauthorized additions
- Supabase Storage provides secure file hosting
- Row-level security can be configured for additional protection

## Deployment

Deploy to Vercel:

```bash
git push origin main
```

Vercel will automatically detect the Next.js app and deploy it. Ensure all environment variables are set in your Vercel project settings.
