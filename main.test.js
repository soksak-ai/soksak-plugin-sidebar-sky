// 시간대 경계와 "다음 전환까지 ms"(폴링 대신 setTimeout 1개의 근거)를 순수 함수로 고정한다.
// node:test — devDep 0. 경계(현지 시각): day 07:00 / sunset 17:00 / dusk 18:30 / night 20:00.
import { test } from "node:test";
import assert from "node:assert/strict";
import { phaseForTime, nextTransitionMs } from "./main.js";

// 로컬 시각 Date — phaseForTime 은 getHours/getMinutes(로컬) 기준.
const at = (h, m, s = 0) => new Date(2026, 5, 16, h, m, s);

const PHASE_CASES = [
  ["06:59", at(6, 59), "night"],
  ["07:00", at(7, 0), "day"],
  ["16:59", at(16, 59), "day"],
  ["17:00", at(17, 0), "sunset"],
  ["18:29", at(18, 29), "sunset"],
  ["18:30", at(18, 30), "dusk"],
  ["19:59", at(19, 59), "dusk"],
  ["20:00", at(20, 0), "night"],
  ["23:30", at(23, 30), "night"],
  ["00:00", at(0, 0), "night"],
];
for (const [label, date, expected] of PHASE_CASES) {
  test(`phaseForTime ${label} → ${expected}`, () => {
    assert.equal(phaseForTime(date), expected);
  });
}

const MIN = 60_000;
test("nextTransitionMs 07:00 → 다음 17:00 (600분)", () => {
  assert.equal(nextTransitionMs(at(7, 0)), 600 * MIN);
});
test("nextTransitionMs 06:00 → 다음 07:00 (60분)", () => {
  assert.equal(nextTransitionMs(at(6, 0)), 60 * MIN);
});
test("nextTransitionMs 18:00 → 다음 18:30 (30분)", () => {
  assert.equal(nextTransitionMs(at(18, 0)), 30 * MIN);
});
test("nextTransitionMs 20:00 → 익일 07:00 (660분, 자정 넘김)", () => {
  assert.equal(nextTransitionMs(at(20, 0)), 660 * MIN);
});
test("nextTransitionMs 16:59:30 → 17:00:00 (30초)", () => {
  assert.equal(nextTransitionMs(at(16, 59, 30)), 30_000);
});
