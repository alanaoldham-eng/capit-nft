import { nanoid } from "nanoid";
import type { ImageGenerationJob, ImageGenerationOptions, ImageGenerationProvider } from "@/types/capit";

export class PlaceholderProvider implements ImageGenerationProvider {
  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationJob> {
    const style = options.style ?? "registry";
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 160));
    return {
      provider: "placeholder",
      jobId: `placeholder_${nanoid()}`,
      status: "succeeded",
      imageUrl: `https://placehold.co/1200x1200/08111f/7dd3fc.png?text=CAPIT+${style.toUpperCase()}+NFT&prompt=${encodedPrompt}`
    };
  }

  async getStatus(jobId: string): Promise<ImageGenerationJob> {
    return { provider: "placeholder", jobId, status: "succeeded" };
  }

  async downloadImage(): Promise<ArrayBuffer> {
    return new TextEncoder().encode("placeholder image bytes").buffer;
  }
}

export class ManualBatchProvider implements ImageGenerationProvider {
  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationJob> {
    return {
      provider: "manual_batch",
      jobId: `manual_${nanoid()}`,
      status: "queued",
      imageUrl: options.metadata?.manualImageUrl ? String(options.metadata.manualImageUrl) : undefined,
      errorMessage: `Prompt queued for manual Ideogram batch export: ${prompt.slice(0, 80)}`
    };
  }

  async getStatus(jobId: string): Promise<ImageGenerationJob> {
    return { provider: "manual_batch", jobId, status: "queued" };
  }

  async downloadImage(result: ImageGenerationJob): Promise<ArrayBuffer> {
    if (!result.imageUrl) return new ArrayBuffer(0);
    const response = await fetch(result.imageUrl);
    return response.arrayBuffer();
  }
}

export class IdeogramProvider implements ImageGenerationProvider {
  constructor(private readonly apiKey: string, private readonly endpoint = process.env.IDEOGRAM_API_URL ?? "https://api.ideogram.ai/v1/ideogram-v3/generate") {}

  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationJob> {
    const aspectRatio = (options.aspectRatio ?? "1:1").replace(":", "x");
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("aspect_ratio", aspectRatio);
    form.append("rendering_speed", "DEFAULT");
    form.append("magic_prompt", "AUTO");
    form.append("style_type", options.style === "registry" ? "DESIGN" : "REALISTIC");
    form.append("num_images", "1");
    if (options.seed !== undefined) form.append("seed", String(options.seed));
    if (options.negativePrompt) form.append("negative_prompt", options.negativePrompt);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Api-Key": this.apiKey },
      body: form
    });

    if (!response.ok) {
      const message = await response.text();
      return { provider: "ideogram", jobId: `ideogram_${nanoid()}`, status: "failed", errorMessage: message };
    }

    const data = await response.json() as { created?: string; data?: Array<{ url?: string; seed?: number }> };
    return {
      provider: "ideogram",
      jobId: data.created ? `ideogram_${data.created}` : `ideogram_${nanoid()}`,
      status: data.data?.[0]?.url ? "succeeded" : "queued",
      imageUrl: data.data?.[0]?.url
    };
  }

  async getStatus(jobId: string): Promise<ImageGenerationJob> {
    return { provider: "ideogram", jobId, status: "queued" };
  }

  async downloadImage(result: ImageGenerationJob): Promise<ArrayBuffer> {
    if (!result.imageUrl) return new ArrayBuffer(0);
    const response = await fetch(result.imageUrl);
    return response.arrayBuffer();
  }
}
