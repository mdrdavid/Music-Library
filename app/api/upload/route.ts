import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'demo123';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const password = formData.get('password') as string;

    // Verify password
    if (password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.mp3')) {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('music')
      .upload(fileName, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('music')
      .getPublicUrl(fileName);

    // Insert song metadata into database
    const { data: songData, error: dbError } = await supabaseAdmin
      .from('songs')
      .insert({
        title: title || file.name.replace('.mp3', ''),
        artist: artist || 'Unknown Artist',
        storage_path: uploadData.path,
        public_url: publicUrlData.publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if DB insert fails
      await supabaseAdmin.storage.from('music').remove([fileName]);
      return NextResponse.json({ error: 'Failed to save song metadata' }, { status: 500 });
    }

    return NextResponse.json(songData);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
