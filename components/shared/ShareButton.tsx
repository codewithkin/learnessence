'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/getErrorMessage';
import React from 'react';

type ShareButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  url?: string;
};

export default function ShareButton({ url, ...props }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
      return;
    }

    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl, title: document.title });
        toast.success('Shared');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Share failed', err);
      toast.error(getErrorMessage(err) || 'Unable to share');
    }
  };

  return (
    <Button variant="outline" size="default" onClick={handleShare} {...props}>
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}
