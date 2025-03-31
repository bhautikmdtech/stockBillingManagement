import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/signup-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for new user registration.'
};

export default function SignUpPage() {
  return <SignUpViewPage />;
} 