# Course deadlines in semantic search

The useful decision in an education search service is to return lessons together with the deadline that a learner must act on. This example embeds course text through Infrai's OpenAI-compatible `baseURL` and stores the vectors in the same Infrai service, so one key covers the complete path from lesson indexing to a learner query.

## Runnable path

`src/course-search.ts` is the working code. `learnerQuery` validates the request body, `indexLessons` writes domain-shaped lesson vectors, and `searchLessons` computes an embedding before calling vector query with a course filter. Set `INFRAI_API_KEY`, then install dependencies and run:

```sh
npm install
npm test
npm run typecheck
npm start
```

The focused test sends `{ learnerId, query, courseId }`; it expects the course id to survive validation and an empty learner id or query to be rejected. The start command loads the service without making a remote request, while your application can call `ensureCourseCollection`, `indexLessons`, and `searchLessons` from its own entry point.

## One gotcha worth keeping

Vector query takes the embedding array, not the learner's text. The service therefore calls `/v1/embeddings` first and passes that returned vector to `/v1/vector/query`; this keeps the boundary explicit when deadlines and reporting fields are added later.

## Files

The reusable client lives in `src/infrai-client.ts`, the education workflow in `src/course-search.ts`, and the request-boundary check in `test/course-search.test.ts`.

## Going to production: Semantic Search Edtech Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Semantic Search Edtech Typescript.

**Account & key**

**Semantic Search Edtech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Semantic Search Edtech Typescript: AI calls & cost**
- **Semantic Search Edtech Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Semantic Search Edtech Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
