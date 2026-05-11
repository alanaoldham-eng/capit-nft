import { NextResponse } from "next/server";
import { PlaceholderProvider, IdeogramProvider, ManualBatchProvider } from "@/lib/art/providers";
import { jsonError } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { provider?: string; prompt: string; style?: "registry" | "premium" | "genesis" };
    if (!payload.prompt || typeof payload.prompt !== "string") {
      return NextResponse.json({ error: "prompt_required" }, { status: 400 });
    }

    const provider = payload.provider === "ideogram" && process.env.IDEOGRAM_API_KEY
      ? new IdeogramProvider(process.env.IDEOGRAM_API_KEY)
      : payload.provider === "manual_batch"
        ? new ManualBatchProvider()
        : new PlaceholderProvider();
    const job = await provider.generateImage(payload.prompt, {
      style: payload.style ?? "registry",
      aspectRatio: "1:1",
      negativePrompt: "cartoon, childish, fantasy oil rig, fake carbon credit claim, greenwashing slogan"
    });
    return NextResponse.json(job);
  } catch (error) {
    return jsonError(error, 500);
  }
}
