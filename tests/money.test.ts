import test from "node:test";
import assert from "node:assert/strict";
import {
  formatRupiah,
  parseRupiahInput,
  toBigIntAmount,
  fromBigIntToNumber,
  isValidTransactionAmount,
  MAX_TRANSACTION_AMOUNT,
} from "../lib/money";

test("formatRupiah - formats positive, negative, and zero properly", () => {
  assert.equal(formatRupiah(1_000_000), "Rp1.000.000");
  assert.equal(formatRupiah(BigInt(4_250_000)), "Rp4.250.000");
  assert.equal(formatRupiah(0), "Rp0");
  assert.equal(formatRupiah(-50_000), "-Rp50.000");
  assert.equal(formatRupiah(1_500_000, { prefix: false }), "1.500.000");
  assert.equal(formatRupiah(500_000, { showSign: true }), "+Rp500.000");
});

test("parseRupiahInput - extracts numbers from formatted user input", () => {
  assert.equal(parseRupiahInput("Rp 1.500.000"), 1_500_000);
  assert.equal(parseRupiahInput("35.000"), 35_000);
  assert.equal(parseRupiahInput("Rp50000"), 50_000);
  assert.equal(parseRupiahInput(""), 0);
  assert.equal(parseRupiahInput("abc"), 0);
});

test("toBigIntAmount and fromBigIntToNumber conversions", () => {
  assert.equal(toBigIntAmount(500_000), BigInt(500_000));
  assert.equal(toBigIntAmount("1.500.000"), BigInt(1_500_000));
  assert.equal(fromBigIntToNumber(BigInt(500_000)), 500_000);
  assert.equal(fromBigIntToNumber(null), 0);
});

test("isValidTransactionAmount - validates allowed range", () => {
  assert.equal(isValidTransactionAmount(1), true);
  assert.equal(isValidTransactionAmount(50_000), true);
  assert.equal(isValidTransactionAmount(MAX_TRANSACTION_AMOUNT), true);

  assert.equal(isValidTransactionAmount(0), false);
  assert.equal(isValidTransactionAmount(-100), false);
  assert.equal(isValidTransactionAmount(MAX_TRANSACTION_AMOUNT + BigInt(1)), false);
});
