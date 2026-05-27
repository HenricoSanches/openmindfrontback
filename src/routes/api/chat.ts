import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `Você é o assistente virtual do OpenMind, uma plataforma de apoio psicológico gratuito para estudantes universitários, atendidos por psicólogos estagiários.

Seu papel:
- Acolher com empatia, sem julgar.
- Oferecer escuta, técnicas básicas de respiração, organização emocional e estudos.
- Quando o usuário descrever sofrimento intenso, persistente, ou pensamentos de se machucar, oriente claramente a procurar um psicólogo.
- Em risco imediato, indicar CVV (188) ou SAMU (192).
- NUNCA forneça diagnóstico clínico.
- Responda em português do Brasil, de forma curta, calma e direta.`;

type ChatRequestBody = {
  messages?: unknown;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", {
            status: 400,
          });
        }

        try {
          const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(
              messages as UIMessage[]
            ),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (e) {
          console.error(e);

          return new Response(
            "Não consegui responder agora.",
            {
              status: 500,
            }
          );
        }
      },
    },
  },
});