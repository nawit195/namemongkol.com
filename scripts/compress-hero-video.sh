#!/bin/bash
# Script to compress the hero video and extract a poster frame
# Requires ffmpeg

mkdir -p public/videos
mkdir -p src/assets

echo "Compressing hero video (if exists)..."
if [ -f "public/videos/hero.mp4" ]; then
  # Extract first frame as poster
  ffmpeg -y -i public/videos/hero.mp4 -vframes 1 -q:v 2 src/assets/hero-poster.jpg
  
  # Compress video with CRF 28 (lower quality, smaller size) and fast preset
  # Assuming the original was too large
  ffmpeg -y -i public/videos/hero.mp4 -vcodec libx264 -crf 28 -preset fast -an public/videos/hero-compressed.mp4
  
  echo "Compression done. Moving files..."
  mv public/videos/hero.mp4 public/videos/hero-original.mp4
  mv public/videos/hero-compressed.mp4 public/videos/hero.mp4
else
  echo "Hero video not found at public/videos/hero.mp4"
fi
