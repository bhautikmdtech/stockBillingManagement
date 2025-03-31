'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function GithubSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      await signIn('github', { callbackUrl: '/api/auth/github-callback' });
    } catch (error) {
      console.error('GitHub login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={loginWithGithub}
      className="w-full"
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Icons.github className="h-4 w-4" />
          <span>GitHub</span>
        </span>
      )}
    </Button>
  );
}
