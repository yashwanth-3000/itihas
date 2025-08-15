import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (optional - fallback to demo user)
    const user = await getAuthenticatedUser(request);
    const userId = user?.id || '1ee6046f-f3fd-4687-aced-ecb258ba2975'; // Fallback to Yashwanth's ID

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('place-images')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', fileName, error);
        return NextResponse.json(
          { success: false, error: `Upload failed: ${error.message}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('place-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images were successfully uploaded' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        urls: uploadedUrls
      }
    });

  } catch (error) {
    console.error('Error in image upload:', error);
    return NextResponse.json(
      { success: false, error: `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}