import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/openmind/Home";
import { usePageNav } from "@/hooks/use-page-nav";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const onNavigate = usePageNav();
  return <Home onNavigate={onNavigate} />;
}
