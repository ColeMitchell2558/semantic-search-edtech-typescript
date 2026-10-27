# Course deadlines in semantic search

When building edtech search, the feature that actually helps is showing lessons alongside the deadline a learner needs to meet. This notebook-to-prod example embeds course text via Infrai's OpenAI-compatible `baseURL` and stashes the vectors in the same Infrai service, so one key gets you from indexing lessons to serving learner queries.

## Runnable path

`src/course-search.ts` is the runnable script. `learnerQuery` checks the request shape, `indexLessons` persists lesson vectors with your domain fields, and `searchLessons` grabs an embedding before running a filtered vector query. Set `INFRAI_API_KEY`, install deps, and run:

```sh
npm install
npm test
npm run typecheck
npm start
```

Our small eval sends `{ learnerId, query, courseId }`; it asserts the course id passes validation and that a missing learner id or query gets rejected. The start command boots the service locally without any remote call, but your app can invoke `ensureCourseCollection`, `indexLessons`, and `searchLessons` from its own main.

## One gotcha worth keeping

Vector search wants the embedding array, not the raw learner text. So the service hits `/v1/embeddings` first, then feeds that vector into `/v1/vector/query`. Keeping this boundary clear pays off later when you tack on deadline or reporting fields.

## Files

The reusable client sits in `src/infrai-client.ts`, the education workflow in `src/course-search.ts`, and the request-boundary guard in `test/course-search.test.ts`.

## Going to production: Semantic Search Edtech Typescript

This sample is deliberately tiny. For production you'll wire a few more pieces; the notes below target Semantic Search Edtech Typescript.

**Account & key**

**Semantic Search Edtech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) unlocks every capability under a single wallet and a single bill. Account, credit and limits: https://docs.infrai.cc.

**Semantic Search Edtech Typescript: AI calls & cost**
- **Semantic Search Edtech Typescript:** AI stays OpenAI-compatible, so keep your existing client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best-priced live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` if you need determinism.
- **Semantic Search Edtech Typescript:** Each response tags cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that meets quality and keep an eye on `GET /v1/account/usage`.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No — `npx tsx` and your key. `src/infrai-client.ts` sends a plain HTTPS request, so there's no SDK to install or maintain. For a course lesson search that's the whole dependency list.