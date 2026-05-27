import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Page } from "@/components/openmind/types";

const ROUTES: Partial<Record<Page, string>> = {
  home: "/",
  login: "/login",
  "register-patient": "/register-patient",
  "register-psychologist": "/register-psychologist",
  dashboard: "/dashboard",
  "admin-dashboard": "/admin-dashboard",
  appointments: "/appointments",
  messages: "/messages",
  evaluation: "/evaluations",
  "medical-records": "/medical-records",
  chatbot: "/chatbot",
  "initial-assessment": "/initial-assessment",
};

export function usePageNav() {
  const navigate = useNavigate();
  return (page: Page) => {
    const path = ROUTES[page];
    if (path) {
      navigate({ to: path });
    } else {
      toast.info("Esta área estará disponível em breve.");
    }
  };
}
