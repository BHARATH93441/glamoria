import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Navbar } from "@/components/glamora/Navbar";
import { Footer } from "@/components/glamora/Footer";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">This page slipped off the runway.</p>
        <a href="/" className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-5 py-2.5">Back to Home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { console.error("Route error:", error); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Navbar />
        <main className="min-h-[60vh]"><Outlet /></main>
        <Footer />
        <Toaster position="top-center" richColors />
      </StoreProvider>
    </QueryClientProvider>
  );
}
