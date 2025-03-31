import { Metadata } from "next";
import SignInViewPage from "@/features/auth/components/sigin-view";

export const metadata: Metadata = {
  title: "Authentication | Sign In",
  description: "Authentication forms built using the components.",
};

export default function SignInPage() {
  return <SignInViewPage />;
}
