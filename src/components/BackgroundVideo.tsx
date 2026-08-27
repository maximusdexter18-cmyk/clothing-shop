"use client";

interface BackgroundVideoProps {
  videoSrc: string;
  posterSrc?: string;
}

export default function BackgroundVideo({ videoSrc, posterSrc }: BackgroundVideoProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        className="w-full h-full object-cover"
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        // This forces the video to render at a lower resolution internally,
        // which makes scrolling MUCH smoother.
        width={1280}
        height={720}
      />
    </div>
  );
}