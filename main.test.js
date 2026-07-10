// 시간대 경계와 "다음 전환까지 ms"(폴링 대신 setTimeout 1개의 근거)를 순수 함수로 고정한다.
// node:test — devDep 0. 경계(현지 시각): day 07:00 / sunset 17:00 / dusk 18:30 / night 20:00.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { phaseForTime, nextTransitionMs, nextForced } from "./main.js";

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

// ── 클릭 순회(자동↔강제 phase 순환) — set 커맨드와 같은 강제 로직을 태우는 순수 함수. ────
test("nextForced: 자동→day→sunset→dusk→night→자동", () => {
  assert.equal(nextForced(null), "day");
  assert.equal(nextForced("day"), "sunset");
  assert.equal(nextForced("sunset"), "dusk");
  assert.equal(nextForced("dusk"), "night");
  assert.equal(nextForced("night"), null);
});

// ── C2 투명성(뷰의 DOM 을 주소지정 가능하게 노출) — 매니페스트 선언 ≡ 소스 배선. ────────
const manifest = JSON.parse(readFileSync(new URL("./plugin.json", import.meta.url)));
const source = readFileSync(new URL("./main.js", import.meta.url), "utf8");
const declaredNodeIds = (manifest.contributes?.nodes ?? []).map((n) => n.id);
// data-node="id" 속성과 dataset.node = "id" 대입 양쪽을 배선으로 인정(base id = 첫 세그먼트).
const wiredNodeIds = [
  ...source.matchAll(/(?:data-node=|dataset\.node\s*=\s*)["']([a-z0-9][\w./-]*)["']/g),
].map((m) => m[1].split("/")[0]);

test("C2: 뷰 보유 시 조작 노드를 최소 1개 노출한다", () => {
  const hasView = (manifest.contributes?.views ?? []).length > 0;
  if (hasView) {
    assert.ok(declaredNodeIds.length >= 1, "뷰가 있으면 contributes.nodes ≥ 1 이어야 한다");
  }
});

test("C2: 선언 노드(contributes.nodes) ≡ 배선(data-node) 양방향", () => {
  const wired = new Set(wiredNodeIds);
  for (const id of declaredNodeIds) {
    assert.ok(wired.has(id), `declared-but-not-wired: ${id}`);
  }
  for (const id of wired) {
    assert.ok(declaredNodeIds.includes(id), `wired-but-not-declared: ${id}`);
  }
});
