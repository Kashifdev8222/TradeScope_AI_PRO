import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Platform, ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/shared/stores/authStore";

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })
  );

  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Remove focus outlines on web
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = `input:focus,textarea:focus,select:focus,[contenteditable]:focus{outline:none!important;box-shadow:none!important}input,textarea,select{outline:none!important}`;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  // Restore auth state from localStorage
  useEffect(() => {
    hydrate();
  }, []);

  // Show loading while hydrating
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D1114", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#1E3852" size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
