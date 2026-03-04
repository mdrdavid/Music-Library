'use client';

import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/audio-player';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/songs');
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      setSongs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (nowPlaying?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setNowPlaying(song);
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Music Library</h1>
          </div>
          <p className="text-muted-foreground">Browse and listen to your music collection</p>
        </div>

        {/* Upload Link */}
        <Button asChild>
          <Link href="/upload">Upload New Song</Link>
        </Button>

        {/* Now Playing */}
        {nowPlaying && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Now Playing
            </h2>
            <AudioPlayer
              title={nowPlaying.title}
              artist={nowPlaying.artist}
              url={nowPlaying.public_url}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Songs List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            All Songs
          </h2>

          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading songs...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : songs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No songs yet. <Link href="/upload" className="text-primary hover:underline">Upload one!</Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {songs.map((song) => (
                <Card
                  key={song.id}
                  className={`cursor-pointer transition-colors ${
                    nowPlaying?.id === song.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-border/80'
                  }`}
                  onClick={() => handlePlaySong(song)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={nowPlaying?.id === song.id && isPlaying ? 'default' : 'ghost'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                      >
                        {nowPlaying?.id === song.id && isPlaying ? 'Pause' : 'Play'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
