import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          registerType: "github",
          role: "user",
        };
      },
    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
          label: "Email",
        },
        password: {
          type: "password",
          label: "Password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

          const response = await fetch(`${baseUrl}/api/auth/login-internal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const user = await response.json();

          if (response.ok && user) {
            return user;
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin", // signin page
    error: "/signin", // Error page (same as signin with error param)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        return true;
      }

      if (!user) {
        console.log("Sign-in callback: no user returned from authorize");
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log("Session callback: Setting session user ID");
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle undefined url
      if (!url) {
        console.log("No URL provided for redirect, using baseUrl:", baseUrl);
        return baseUrl;
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log("Redirect to relative URL:", url);
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log("Redirect to same-origin URL:", url);
        return url;
      }
      console.log("Redirect to base URL:", baseUrl);
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
