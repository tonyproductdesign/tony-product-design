import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeSearch, validateEnquiry, emptyEnquiry, buildEnquiryText, makeMailto, isHttpsEndpoint, filterProjects } from "../src/lib/logic.ts";

const valid = { ...emptyEnquiry, name: "Test Engineer", email: "engineer@example.com", message: "We need help reviewing a prototype PCB design.", consent: true };
const projects = JSON.parse(readFileSync(new URL("../public/data/projects.json", import.meta.url), "utf8"));
test("English/Vietnamese search is accent-insensitive", () => {
  assert.equal(normalizeSearch("  ĐIỆN TỬ  "), "dien tu");
  assert.equal(normalizeSearch("Cơ khí"), "co khi");
});
test("a complete enquiry passes validation", () => assert.deepEqual(validateEnquiry(valid, ["pcb-design"]), {}));
test("invalid required fields and missing consent are rejected", () => {
  const errors = validateEnquiry(emptyEnquiry, ["pcb-design"]);
  assert.deepEqual(Object.keys(errors).sort(), ["consent", "email", "message", "name"]);
});
test("unknown services and timelines are rejected", () => {
  assert.ok(validateEnquiry({ ...valid, service: "injected" }, ["pcb-design"]).service);
  assert.ok(validateEnquiry({ ...valid, timeline: "999" }, []).timeline);
});
test("unreasonable lengths are rejected", () => {
  const errors = validateEnquiry({ ...valid, name: "a".repeat(101), company: "a".repeat(151), message: "a".repeat(5001) }, []);
  assert.ok(errors.name && errors.company && errors.message);
});
test("mail addresses reject whitespace and malformed domains", () => {
  for (const email of ["a b@example.com", "a@", "example.com", "@example.com", "a@b"]) assert.ok(validateEnquiry({ ...valid, email }, []).email);
});
test("query values are percent-encoded, including line breaks", () => {
  const result = makeMailto("brian@tonyproductdesign.com", "Hello\r\nBcc: x@y.com", "a&b?c\nXin chào");
  assert.ok(result.startsWith("mailto:brian%40tonyproductdesign.com?subject="));
  assert.ok(result.includes("a%26b%3Fc%0A"));
  assert.ok(!result.includes("\r"));
  assert.ok(!result.includes("&bcc="));
});
test("only HTTPS form endpoints are accepted", () => {
  assert.equal(isHttpsEndpoint("https://forms.example.com/submit"), true);
  for (const url of ["", "javascript:alert(1)", "http://forms.example.com", "/api/contact"]) assert.equal(isHttpsEndpoint(url), false);
});
test("draft contains the exact enquiry and selected labels", () => {
  const result = buildEnquiryText(valid, { name: "Name", email: "Email", company: "Company", service: "Service", timeline: "Timeline", message: "Message" }, "PCB design", "Discuss");
  assert.ok(result.includes(`Name: ${valid.name}`));
  assert.ok(result.includes(valid.message));
  assert.ok(result.includes("Service: PCB design"));
});
test("project filters compose category and bilingual search", () => {
  assert.equal(filterProjects(projects, "all", "").length, 6);
  assert.equal(filterProjects(projects, "product", "").length, 2);
  assert.equal(filterProjects(projects, "mechanical", "").length, 1);
  assert.equal(filterProjects(projects, "electronics", "PCB").length, 1);
  assert.equal(filterProjects(projects, "prototype", "").length, 1);
  assert.equal(filterProjects(projects, "manufacturing", "").length, 1);
  assert.equal(filterProjects(projects, "all", "DOES_NOT_EXIST").length, 0);
});
test("the generated draft carries Tony's brand", () => {
  const result = buildEnquiryText(valid, { name: "Name", email: "Email", company: "Company", service: "Service", timeline: "Timeline", message: "Message" }, "Industrial design", "Discuss");
  assert.ok(result.startsWith("Tony PRODUCT DESIGN"));
});
