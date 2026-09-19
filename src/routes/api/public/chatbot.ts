import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ChatbotSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.string().max(1200)).max(8).optional().default([]),
});

export const Route = createFileRoute("/api/public/chatbot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = ChatbotSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const { answerChatbot } = await import("@/lib/chatbot/knowledge");
        const result = await answerChatbot(parsed.data.message, parsed.data.history);

        return Response.json(result);
      },
    },
  },
});
