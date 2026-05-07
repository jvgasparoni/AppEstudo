import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAttempts } from "../lib/stats-core";
import { isCorrect, nextSrs } from "../lib/srs";

test("isCorrect works",()=>{ assert.equal(isCorrect("A","A"), true); assert.equal(isCorrect("B","A"), false); });

test("summarize attempts", ()=>{
  const r = summarizeAttempts([{correct:true,question:{subject:"Mat",theme:"A"}},{correct:false,question:{subject:"Mat",theme:"A"}},{correct:true,question:{subject:"Geo",theme:"B"}}]);
  assert.equal(r.total,3); assert.equal(r.correct,2); assert.equal(r.bySubject.Mat.total,2);
});

test("srs increases intervals", ()=>{
  const base={intervalDays:2,easeFactor:2.5,reviewCount:1,lapseCount:0};
  const good=nextSrs(base,"GOOD");
  const again=nextSrs(base,"AGAIN", { againToday: true });
  assert.ok(good.intervalDays>base.intervalDays);
  assert.equal(again.intervalDays,0);
  assert.equal(again.lapseCount,1);
});
