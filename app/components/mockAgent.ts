"use client";

// Inline mock-agent. Geen LLM, geen backend. Reageert op trefwoorden in de user input
// en geeft een lijst replies terug plus optionele side-effects op shared state.

type Reply =
  | { role: "assistant"; kind: "text"; text: string }
  | { role: "assistant"; kind: "chart"; title: string; data: Record<string, number> }
  | { role: "assistant"; kind: "approval"; action: string };

export type AgentResult = {
  replies: Reply[];
  bump?: { region: "EU" | "US" | "APAC"; delta: number };
  reset?: boolean;
  approved?: string;
};

const DEFAULT_REGIONS = ["EU", "US", "APAC"] as const;

export async function processCommand(input: string): Promise<AgentResult> {
  const text = input.toLowerCase().trim();
  // kleine denkpauze zodat 't niet instant voelt
  await new Promise((r) => setTimeout(r, 400));

  // reset
  if (/^(reset|wis|clear|opnieuw)$/i.test(text)) {
    return {
      replies: [{ role: "assistant", kind: "text", text: "State gereset. Sales terug naar startwaarden." }],
      reset: true,
    };
  }

  // approve / reject flows
  if (/^(akkoord|ja|approve|go|doe maar)$/i.test(text)) {
    return {
      replies: [
        {
          role: "assistant",
          kind: "text",
          text: "Top. Actie bevestigd — 20% korting is geactiveerd. Bekijk het panel rechts voor de status.",
        },
      ],
      approved: "discount_20_percent",
    };
  }
  if (/^(wijs af|nee|no|stop|cancel)$/i.test(text)) {
    return {
      replies: [{ role: "assistant", kind: "text", text: "Begrepen, ik annuleer de actie." }],
    };
  }

  // chart / render
  if (/(render|chart|grafiek|diagram|teken|show me|laat zien)/i.test(text)) {
    const seed = { EU: 120, US: 200, APAC: 85 };
    const offset = Math.floor(Math.random() * 30);
    return {
      replies: [
        { role: "assistant", kind: "text", text: "Even een live diagram genereren…" },
        {
          role: "assistant",
          kind: "chart",
          title: "Live sales per regio",
          data: {
            EU: seed.EU + offset,
            US: seed.US - Math.floor(offset / 2),
            APAC: seed.APAC + Math.floor(offset / 3),
          },
        },
        {
          role: "assistant",
          kind: "text",
          text:
            "Deze chart is in de chat gegenereerd door de agent. Hij deelt state met het panel rechts — als je straks +10 typt, bewegen ze allebei.",
        },
      ],
    };
  }

  // sales bump: +10, -5, etc.
  const bumpMatch = text.match(/^([+-]?\d+)\s*(eu|us|apac)?$/i);
  if (bumpMatch) {
    const delta = parseInt(bumpMatch[1], 10);
    const region = (bumpMatch[2]?.toUpperCase() ?? "EU") as "EU" | "US" | "APAC";
    if (!DEFAULT_REGIONS.includes(region)) {
      return {
        replies: [
          { role: "assistant", kind: "text", text: `Onbekende regio '${region}'. Gebruik EU, US of APAC.` },
        ],
      };
    }
    return {
      replies: [
        {
          role: "assistant",
          kind: "text",
          text: `Sales ${region} aangepast met ${delta > 0 ? "+" : ""}${delta}. Zie je de bar verschuiven?`,
        },
      ],
      bump: { region, delta },
    };
  }

  // propose / human-in-the-loop
  if (/(korting|discount|actie|doe iets|action)/i.test(text)) {
    return {
      replies: [
        { role: "assistant", kind: "text", text: "Ik wil een gevoelige actie voorstellen. Even op jou wachten…" },
        {
          role: "assistant",
          kind: "approval",
          action: "discount_20_percent",
        },
      ],
    };
  }

  // fallback
  return {
    replies: [
      {
        role: "assistant",
        kind: "text",
        text:
          "Hmm, dat snap ik nog niet. Probeer:\n• render chart\n• +10 of −5\n• korting (voor human-in-the-loop)\n• akkoord / wijs af\n• reset",
      },
    ],
  };
}
