import { createFileRoute } from "@tanstack/react-router";
import { InitialAssessment } from "@/components/openmind/InitialAssessment";

export const Route = createFileRoute("/_authenticated/initial-assessment")({
  component: InitialAssessment,
  head: () => ({ meta: [{ title: "Prontuário Inicial — OpenMind" }] }),
});
