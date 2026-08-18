"use client";

import { useState } from "react";

export default function ShareButtons({ imageUrl }: { imageUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <a href={imageUrl} download="skillforge-certificate.png" className="btn btn-primary">
        Download image
      </a>
      <button type="button" onClick={copyLink} className="btn btn-ghost">
        {copied ? "Link copied!" : "Copy shareable link"}
      </button>
    </div>
  );
}
