import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { Index } from "@upstash/vector";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Redis } from "@upstash/redis/cloudflare";

const app = new Hono();

type Environment = {
  VECTOR_URL: string;
  VECTOR_TOKEN: string;
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
};

const semanticSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 25,
  separators: [" "],
  chunkOverlap: 12,
});

app.use(cors());

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // Time window in seconds
const MAX_REQUESTS = 100; // Max requests per IP in the window

const WHITELIST = ["swear"];
const PROFANITY_THRESHOLD = 0.86;

// Rate limiting middleware
async function rateLimiter(c: any, next: any) {
  const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } = env<Environment>(c);

  const redis = new Redis({
    url: UPSTASH_REDIS_URL,
    token: UPSTASH_REDIS_TOKEN,
  });

  const ip = c.req.header("CF-Connecting-IP");

  if (!ip) {
    return c.json(
      { error: "IP address is required for rate limiting." },
      { status: 400 }
    );
  }

  const currentCount = await redis.incr(ip);
  
  if (currentCount === 1) {
    await redis.expire(ip, RATE_LIMIT_WINDOW);
  }

  if (currentCount > MAX_REQUESTS) {
    return c.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  await next();
}

app.post("/", rateLimiter, async (c) => {
  if (c.req.header("Content-Type") !== "application/json") {
    return c.json({ error: "JSON body expected" }, { status: 406 });
  }

  try {
    const { VECTOR_TOKEN, VECTOR_URL } = env<Environment>(c);

    const index = new Index({
      url: VECTOR_URL,
      token: VECTOR_TOKEN,
      cache: false,
    });

    const body = await c.req.json();
    let { message } = body as { message: string };

    if (!message) {
      return c.json(
        { error: "Message argument is required." },
        { status: 400 }
      );
    }
    if (message.length > 1000) {
      return c.json(
        { error: "Message cannot exceed 1000 characters." },
        { status: 413 }
      );
    }

    message = message
      .split(/\s/)
      .filter((word) => !WHITELIST.includes(word.toLowerCase()))
      .join(" ");

    const [semanticChunks, wordChunks] = await Promise.all([
      splitTextIntoSemantics(message),
      splitTextIntoWords(message),
    ]);

    const flaggedFor = new Set<{ score: number; text: string }>();

    const vectorRes = await Promise.all([
      ...wordChunks.map(async (wordChunk) => {
        const [vector] = await index.query({
          topK: 1,
          data: wordChunk,
          includeMetadata: true,
        });

        if (vector && vector.score > 0.95) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }

        return { score: 0 };
      }),
      ...semanticChunks.map(async (semanticChunk) => {
        const [vector] = await index.query({
          topK: 1,
          data: semanticChunk,
          includeMetadata: true,
        });

        if (vector && vector.score > PROFANITY_THRESHOLD) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }

        return vector!;
      }),
    ]);

    if (flaggedFor.size > 0) {
      const sorted = Array.from(flaggedFor).sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0];

      return c.json({
        isProfanity: true,
        score: sorted.score,
        flaggedFor: sorted.text,
      });
    } else {
      const mostProfaneChunk = vectorRes.sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0];

      return c.json({
        isProfanity: false,
        score: mostProfaneChunk.score,
      });
    }
  } catch (err) {
    console.log(err);

    return c.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
});

function splitTextIntoWords(text: string) {
  return text.split(/\s/);
}

async function splitTextIntoSemantics(text: string) {
  if (text.split(/\s/).length === 1) return [];
  const documents = await semanticSplitter.createDocuments([text]);
  const chunks = documents.map((chunk) => chunk.pageContent);
  return chunks;
}

export default app;
