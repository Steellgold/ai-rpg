"use client";

export const useSession = () => {
  return {
    user: null,
    isLoading: false,
    error: null,
    signIn: () => {
      console.log("Sign in clicked");
    }
  };
}