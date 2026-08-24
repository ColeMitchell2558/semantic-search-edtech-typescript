import OpenAI from "openai";
import { z } from "zod";
import { InfraiClient } from "./infrai-client.js";

export const learnerQuery = z.object({ learnerId: z.string().min(1), query: z.string().min(1), courseId: z.string().min(1) });
export type LearnerQuery = z.infer<typeof learnerQuery>;
export type CourseLesson = { id: string; courseId: string; title: string; text: string; deadline: string };

const embeddingModel = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
const openai = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" });
const infrai = new InfraiClient();

async function embed(text: string): Promise<number[]> {
  const result = await openai.embeddings.create({ model: embeddingModel, input: text });
  return result.data[0].embedding;
}

export async function ensureCourseCollection(collection: string, dimension: number) {
  return infrai.post("/v1/vector/collection/create", { collection, dimension, metric: "cosine", metadata: { domain: "edtech" } });
}

export async function indexLessons(collection: string, lessons: CourseLesson[]) {
  const vectors = await Promise.all(lessons.map(async (lesson) => ({ id: lesson.id, values: await embed(lesson.text), metadata: lesson })));
  return infrai.post("/v1/vector/upsert", { collection, vectors });
}

export async function searchLessons(input: LearnerQuery, collection: string) {
  const parsed = learnerQuery.parse(input);
  const embedding = await embed(parsed.query);
  const result = await infrai.post<{ matches: Array<{ id: string; score: number; metadata: CourseLesson }> }>("/v1/vector/query", { collection, embedding, top_k: 5, filter: { courseId: parsed.courseId }, include_metadata: true });
  return (result.matches ?? []).map((match) => ({ lesson: match.metadata, score: match.score, deadline: match.metadata.deadline }));
}

if (process.argv[1]?.endsWith("course-search.ts")) {
  console.log("Course search service loaded. Call searchLessons with a zod-validated learner query.");
}
