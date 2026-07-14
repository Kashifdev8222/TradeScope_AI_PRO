/**
 * TradeScope AI — Entry Point
 * Redirects authenticated users to /client, others to /login.
 */
import { Redirect } from "expo-router";
import { useAuthStore } from "../src/shared/stores/authStore";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/client" />;
  }
  return <Redirect href="/login" />;
}
