import ky, { KyInstance } from "ky";

type OpenAIStreamChunk = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }[];
};

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export class OpenAI {
  private ky: KyInstance;

  constructor(opts: {
    /** API Key */
    apiKey: string;
    /** Base URL */
    baseUrl?: string;
  }) {
    const prefixUrl = opts.baseUrl || DEFAULT_BASE_URL;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${opts.apiKey}`,
    };
    this.ky = ky.create({ prefixUrl, headers });
  }

  async createChatCompletion(
    messages: { role: string; content: string }[],
    model = "gpt-4o",
    stream = false
  ) {
    return await this.ky.post("chat/completions", {
      json: {
        model,
        messages,
        stream,
      },
      timeout: 70000,
    });
  }

  static createAsyncIterableStreamFromOpenAIResponse(
    res: Response
  ): AsyncIterable<string> {
    const decoder = new TextDecoder("utf-8");
    let left = "";

    const ai = {
      async *[Symbol.asyncIterator]() {
        for await (const c of res.body as ReadableStream<Uint8Array>) {
          const decoded = decoder.decode(c, { stream: true });

          const withLeft = left + decoded;
          const dataLines = withLeft.split("\n");

          left = dataLines.pop() || "";

          for (const ln of dataLines) {
            const line = ln.trim();
            if (!line.startsWith("data: ")) continue;
            if (line === "data: [DONE]") return;

            const t = parseDataLine(line);
            if (t) yield t;
          }
        }
      },
    };
    return ai;
  }
}

function parseDataLine(ln: string): string | undefined {
  try {
    const data = JSON.parse(ln.substring(6)) as OpenAIStreamChunk;
    return data.choices?.[0]?.delta?.content;
  } catch (e) {
    console.error(e);
    console.log(`Unable to parse [${ln.substring(6)}] as JSON`);
    return undefined;
  }
}
