import { learnerQuery } from "../src/course-search.js";
const valid = learnerQuery.safeParse({ learnerId: "learner-7", query: "When is the fractions quiz?", courseId: "math-101" });
if (!valid.success || valid.data.courseId !== "math-101") throw new Error("valid learner query was rejected");
const invalid = learnerQuery.safeParse({ learnerId: "", query: "", courseId: "math-101" });
if (invalid.success) throw new Error("empty learner query was accepted");
console.log("learner query boundary passed");
