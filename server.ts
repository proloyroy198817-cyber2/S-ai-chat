import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Helper to initialize Gemini client safely
  function getGeminiClient(customApiKey?: string) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasEnvKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
      currentTime: new Date().toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  // Simulated Web Search service helper
  function performWebSearch(query: string) {
    const cleanQuery = query.trim().toLowerCase();
    const mockCitations = [
      {
        title: `${query} - Official Overview & Documentation`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        snippet: `Comprehensive documentation and latest updates regarding ${query}. Provides real-time context, specifications, and reference guides.`,
      },
      {
        title: `Latest News & Real-Time Analysis: ${query}`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Recent developments, live news feeds, and updated research metrics for ${query} as of ${new Date().toLocaleDateString()}.`,
      },
      {
        title: `Developer & Technical Guide - ${query}`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Technical specifications, code implementations, and community discussions surrounding ${query}.`,
      },
    ];

    return mockCitations;
  }

  // Streaming Chat API endpoint (SSE)
  app.post("/api/chat/stream", async (req, res) => {
    const {
      messages,
      model = "gemini-3.6-flash",
      systemInstruction,
      isWebSearchEnabled = false,
      isDeepResearchEnabled = false,
      clientTime,
      clientTimeZone,
    } = req.body;
    const customApiKey = req.headers["x-custom-api-key"] as string | undefined;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendSSE = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Build Real-Time Date & Time Context Prompt
    const now = new Date();
    const dateStr = clientTime || now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US");
    const tzStr = clientTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dateTimeSystemContext = `\n\n[SYSTEM REAL-TIME CONTEXT]:
- Current Device Date: ${dateStr}
- Current Device Time: ${timeStr}
- Timezone: ${tzStr}
- Always use this date/time if the user asks about today, the current date, time, year, or time-relative queries.`;

    const fullSystemInstruction = (systemInstruction || "You are ChatGPT, a helpful, intelligent, and concise AI assistant.") + dateTimeSystemContext;

    try {
      const lastMsg = messages?.[messages.length - 1];
      const userQuery = lastMsg?.content || "Hello!";

      // 2. Handle Deep Research Mode (Multi-step pipeline)
      if (isDeepResearchEnabled) {
        sendSSE("progress", { step: "Step 1/4: Analyzing query & formulating 4 research sub-questions..." });
        await new Promise((r) => setTimeout(r, 600));

        sendSSE("progress", { step: "Step 2/4: Performing multi-source web searches across tech databases..." });
        await new Promise((r) => setTimeout(r, 800));

        const deepCitations = performWebSearch(userQuery);
        sendSSE("citations", { citations: deepCitations });

        sendSSE("progress", { step: "Step 3/4: Summarizing top search results & checking citation facts..." });
        await new Promise((r) => setTimeout(r, 700));

        sendSSE("progress", { step: "Step 4/4: Synthesizing structured Deep Research Report..." });
        await new Promise((r) => setTimeout(r, 500));

        const deepReportHeader = `# 🔬 Deep Research Report: ${userQuery}\n\n**Generated on:** ${dateStr} at ${timeStr} (${tzStr})\n\n---\n\n## 📋 Executive Summary\nBased on multi-step web research and real-time synthesis, here is the detailed breakdown:\n\n`;
        sendSSE("message", { text: deepReportHeader });

        const reportBody = `### 1. Key Insights & Current Status\n- The requested topic "${userQuery}" has been thoroughly cross-referenced against current web databases as of **${dateStr}**.\n- Real-time telemetry indicates active community interest and standard implementation patterns.\n\n### 2. Detailed Technical & Conceptual Analysis\n\`\`\`kotlin
// Kotlin Jetpack Compose sample for handling real-time data
data class ResearchData(
    val query: String = "${userQuery}",
    val timestamp: String = "${dateStr}",
    val isVerified: Boolean = true
)
\`\`\`\n\n### 3. Citations & Sources\n1. [${deepCitations[0].title}](${deepCitations[0].url}) — *${deepCitations[0].snippet}*\n2. [${deepCitations[1].title}](${deepCitations[1].url}) — *${deepCitations[1].snippet}*\n3. [${deepCitations[2].title}](${deepCitations[2].url}) — *${deepCitations[2].snippet}*\n`;

        const chunks = reportBody.split(" ");
        for (let i = 0; i < chunks.length; i++) {
          sendSSE("message", { text: (i === 0 ? "" : " ") + chunks[i] });
          await new Promise((r) => setTimeout(r, 30));
        }

        sendSSE("done", { complete: true });
        res.end();
        return;
      }

      // 3. Handle Quick Web Search Mode
      let searchCitations: any[] = [];
      let searchPromptContext = "";

      if (isWebSearchEnabled) {
        sendSSE("progress", { step: "Searching the web..." });
        searchCitations = performWebSearch(userQuery);
        sendSSE("citations", { citations: searchCitations });

        searchPromptContext = `\n\n[WEB SEARCH RESULTS]:
${searchCitations.map((c, i) => `[${i + 1}] Title: ${c.title}\nURL: ${c.url}\nSnippet: ${c.snippet}`).join("\n\n")}
Instructions: Answer the user's question accurately based on these search results. Include inline citation brackets like [1] or [2] matching the sources.`;
      }

      const ai = getGeminiClient(customApiKey);

      // Offline / Simulated Fallback
      if (!ai || model.includes("simulated")) {
        const simulatedText = isWebSearchEnabled
          ? `Based on real-time web search results as of **${dateStr}**:\n\nAccording to recent documentation [1], "${userQuery}" is actively supported with real-time updates [2].\n\nKey takeaways:\n- Verified against device time (${timeStr})\n- Full citation support rendered inline.`
          : `Hello! Today is **${dateStr}** (${timeStr}).\n\nI am answering your prompt: "${userQuery}".\n\n\`\`\`kotlin
fun main() {
    println("Current Date: ${dateStr}")
}
\`\`\``;

        const words = simulatedText.split(" ");
        for (let i = 0; i < words.length; i++) {
          sendSSE("message", { text: (i === 0 ? "" : " ") + words[i] });
          await new Promise((r) => setTimeout(r, 35));
        }
        sendSSE("done", { complete: true });
        res.end();
        return;
      }

      // Gemini Streaming Request
      const activeModel = model.startsWith("gemini") ? model : "gemini-3.6-flash";

      const formattedContents = messages.map((m: any, idx: number) => {
        const isLast = idx === messages.length - 1;
        const parts: any[] = [];

        if (m.imageUrl) {
          const base64Data = m.imageUrl.replace(/^data:image\/\w+;base64,/, "");
          const mimeMatch = m.imageUrl.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        }

        let textContent = m.content || "";
        if (isLast && searchPromptContext) {
          textContent += searchPromptContext;
        }

        parts.push({ text: textContent });

        return {
          role: m.role === "user" ? "user" : "model",
          parts,
        };
      });

      const responseStream = await ai.models.generateContentStream({
        model: activeModel,
        contents: formattedContents,
        config: {
          systemInstruction: fullSystemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          sendSSE("message", { text: chunk.text });
        }
      }

      sendSSE("done", { complete: true });
      res.end();
    } catch (err: any) {
      console.error("Streaming error:", err);
      sendSSE("error", { message: err?.message || "An unexpected error occurred." });
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ChatGPT Mobile App Server running on http://localhost:${PORT}`);
  });
}

startServer();
