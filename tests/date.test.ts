import test from "node:test";
import assert from "node:assert/strict";
import {
  getMonthRangeWIB,
  createWIBDate,
  getWIBComponents,
  formatDateIndo,
  getGreetingWIB,
} from "../lib/date";

test("getMonthRangeWIB - correct start and end boundaries in UTC for WIB month", () => {
  // October 2026
  const { start, end } = getMonthRangeWIB(2026, 10);

  // 1 Oct 2026 00:00:00 WIB is 30 Sep 2026 17:00:00 UTC
  assert.equal(start.toISOString(), "2026-09-30T17:00:00.000Z");

  // 31 Oct 2026 23:59:59.999 WIB is 31 Oct 2026 16:59:59.999 UTC
  assert.equal(end.toISOString(), "2026-10-31T16:59:59.999Z");
});

test("PRD Edge Case #1 - late night transaction remains in current month", () => {
  // 31 October 2026 23:50:00 WIB
  const lateNight = createWIBDate(2026, 10, 31, 23, 50, 0);
  const { start: octStart, end: octEnd } = getMonthRangeWIB(2026, 10);

  assert.ok(lateNight.getTime() >= octStart.getTime());
  assert.ok(lateNight.getTime() <= octEnd.getTime());

  const components = getWIBComponents(lateNight);
  assert.equal(components.month, 10);
  assert.equal(components.day, 31);
});

test("PRD Edge Case #1 - next day 00:30 WIB is in the new month", () => {
  // 1 November 2026 00:30:00 WIB
  const nextDayEarly = createWIBDate(2026, 11, 1, 0, 30, 0);
  const { end: octEnd } = getMonthRangeWIB(2026, 10);
  const { start: novStart, end: novEnd } = getMonthRangeWIB(2026, 11);

  // Must NOT fall into October
  assert.ok(nextDayEarly.getTime() > octEnd.getTime());
  // Must fall into November
  assert.ok(nextDayEarly.getTime() >= novStart.getTime());
  assert.ok(nextDayEarly.getTime() <= novEnd.getTime());

  const components = getWIBComponents(nextDayEarly);
  assert.equal(components.month, 11);
  assert.equal(components.day, 1);
});

test("formatDateIndo - formats Indonesian date strings", () => {
  const d = createWIBDate(2026, 10, 5, 14, 30, 0);
  assert.equal(formatDateIndo(d), "5 Oktober 2026");
  assert.equal(formatDateIndo(d, { withDay: true }), "Senin, 5 Oktober 2026");
  assert.equal(formatDateIndo(d, { withTime: true }), "5 Oktober 2026, 14:30");
});

test("getGreetingWIB - provides appropriate greetings", () => {
  const morning = createWIBDate(2026, 10, 5, 8, 0, 0);
  const noon = createWIBDate(2026, 10, 5, 12, 0, 0);
  const afternoon = createWIBDate(2026, 10, 5, 16, 0, 0);
  const night = createWIBDate(2026, 10, 5, 21, 0, 0);

  assert.equal(getGreetingWIB(morning), "Selamat pagi");
  assert.equal(getGreetingWIB(noon), "Selamat siang");
  assert.equal(getGreetingWIB(afternoon), "Selamat sore");
  assert.equal(getGreetingWIB(night), "Selamat malam");
});
