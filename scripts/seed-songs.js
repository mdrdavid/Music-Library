import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummySongs = [
  {
    title: 'Midnight Dreams',
    artist: 'Luna Echo',
    storage_path: 'dummy/midnight-dreams.mp3',
    public_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    title: 'Electric Sunrise',
    artist: 'Neon Pulse',
    storage_path: 'dummy/electric-sunrise.mp3',
    public_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    title: 'Cosmic Journey',
    artist: 'Star Dust',
    storage_path: 'dummy/cosmic-journey.mp3',
    public_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    title: 'Ocean Waves',
    artist: 'Sea Salt',
    storage_path: 'dummy/ocean-waves.mp3',
    public_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    title: 'Autumn Leaves',
    artist: 'Golden Hour',
    storage_path: 'dummy/autumn-leaves.mp3',
    public_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
];

async function seedSongs() {
  try {
    console.log('Seeding dummy songs...');

    // Clear existing songs
    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error deleting existing songs:', deleteError);
    }

    // Insert dummy songs
    const { data, error } = await supabase
      .from('songs')
      .insert(dummySongs)
      .select();

    if (error) {
      console.error('Error inserting songs:', error);
      process.exit(1);
    }

    console.log(`Successfully seeded ${data.length} songs`);
    process.exit(0);
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  }
}

seedSongs();
