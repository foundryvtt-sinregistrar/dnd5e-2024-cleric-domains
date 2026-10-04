import assert from "node:assert/strict";
import test from "node:test";
import { FEATURES } from "../scripts/automation/constants.mjs";
import { featureIs } from "../scripts/automation/utils.mjs";
test("automation identifies features by stable identifier", () => {
  assert.equal(featureIs({ item: { system: { identifier: FEATURES.wrath } } }, FEATURES.wrath), true);
  assert.equal(featureIs({ item: { system: { identifier: "other" } } }, FEATURES.wrath), false);
});
