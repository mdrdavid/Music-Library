"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Song {
  id: string;
  title: string;
  artist: string;
  public_url: string;
  created_at: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, nowPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      const currentIndex = songs.findIndex((s) => s.id === nowPlaying?.id);
      if (currentIndex < songs.length - 1) {
        setNowPlaying(songs[currentIndex + 1]);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nowPlaying, songs]);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      const data = await response.json();
      setSongs(data);
      if (data.length > 0 && !nowPlaying) {
        setNowPlaying(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song: Song) => {
    if (nowPlaying?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setNowPlaying(song);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "url(/audio-music-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Hidden audio element */}
      {nowPlaying && (
        <audio
          ref={audioRef}
          src={nowPlaying.public_url}
          crossOrigin="anonymous"
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {!showPlaylist ? (
          <>
            {/* Main Player View */}
            <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
              <div className="text-center space-y-1">
                <h1 className="text-5xl font-bold tracking-tight">
                  <span className="text-cyan-400">Audio</span>
                  <span className="text-white"> Music</span>
                </h1>
                <p className="text-gray-300 text-sm tracking-widest font-light">
                  Feel the Hit!
                </p>
              </div>
            </div>

            {/* Sound wave visualization */}
            <div className="flex items-center justify-center gap-1 mb-12">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full animate-pulse"
                  style={{
                    height: `${20 + i * 4}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Now Playing Info */}
            {nowPlaying && (
              <div className="text-center mb-8 max-w-md">
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">
                  Now Playing
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {nowPlaying.title}
                </h2>
                <p className="text-cyan-400">{nowPlaying.artist}</p>
              </div>
            )}

            {/* Progress Bar */}
            {nowPlaying && (
              <div className="w-full max-w-md mb-6 space-y-2">
                <div
                  className="h-1 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Ready to stream text */}
            <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">
              Ready to stream
            </p>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-8">
              {/* Volume Control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-cyan-400 transition"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (audioRef.current) {
                    audioRef.current.volume = parseFloat(e.target.value);
                  }
                  setIsMuted(false);
                }}
                className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer accent-cyan-400"
              />

              {/* Play/Pause Button */}
              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-semibold px-8 py-6 rounded-full text-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </Button>
            </div>

            {/* View Playlist Button */}
            <Button
              variant="outline"
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
              onClick={() => setShowPlaylist(true)}
            >
              View Playlist ({songs.length})
            </Button>
          </>
        ) : (
          <>
            {/* Playlist View */}
            <div className="w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="space-y-4 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Playlist</h2>
                  <Button
                    variant="ghost"
                    text-sm="true"
                    className="text-cyan-400 hover:text-cyan-300"
                    onClick={() => setShowPlaylist(false)}
                  >
                    Back to Player
                  </Button>
                </div>

                {songs.map((song) => (
                  <Card
                    key={song.id}
                    className={`cursor-pointer transition-colors ${
                      nowPlaying?.id === song.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => playSong(song)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">
                            {song.title}
                          </h3>
                          <p className="text-sm text-gray-400">{song.artist}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            nowPlaying?.id === song.id && isPlaying
                              ? "default"
                              : "ghost"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            playSong(song);
                          }}
                          className={
                            nowPlaying?.id === song.id && isPlaying
                              ? "bg-cyan-400"
                              : ""
                          }
                        >
                          {nowPlaying?.id === song.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
