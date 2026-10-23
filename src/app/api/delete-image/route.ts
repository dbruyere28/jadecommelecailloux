import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'publicId manquant' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return NextResponse.json(
        { error: 'Échec de la suppression', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}