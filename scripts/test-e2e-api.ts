async function testE2E() {
  const baseUrl = "http://localhost:3000";
  console.log("=== Running End-to-End API and Flow Validation ===");

  // 1. Landing Page
  console.log("1. Testing GET /");
  const landingRes = await fetch(`${baseUrl}/`);
  console.log("   Status:", landingRes.status);
  const landingHtml = await landingRes.text();
  if (landingHtml.includes("AI Age Prediction Hub") && landingHtml.includes("Two AI models. One dashboard.")) {
    console.log("   ✓ Landing page loaded with correct hero title and tagline");
  } else {
    throw new Error("Landing page content mismatch");
  }

  // 2. Registration API
  const testEmail = `alex_${Date.now()}@example.com`;
  console.log(`2. Testing POST /api/register with ${testEmail}`);
  const regRes = await fetch(`${baseUrl}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dr. Alex Rivera",
      email: testEmail,
      password: "SecurePassword123",
    }),
  });

  console.log("   Status:", regRes.status);
  const regJson = await regRes.json();
  console.log("   Response:", regJson);
  if (!regJson.success || !regJson.devVerifyUrl) {
    throw new Error("Registration failed: " + JSON.stringify(regJson));
  }
  console.log("   ✓ Registration succeeded and returned dev verification URL");

  const verifyUrl = new URL(regJson.devVerifyUrl);
  const token = verifyUrl.searchParams.get("token");
  if (!token) throw new Error("No token in verification URL");

  // 3. Verify API with invalid token
  console.log("3. Testing POST /api/verify with invalid token");
  const invalidVerifyRes = await fetch(`${baseUrl}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "invalid-token-12345" }),
  });
  console.log("   Status:", invalidVerifyRes.status);
  const invalidVerifyJson = await invalidVerifyRes.json();
  console.log("   Response:", invalidVerifyJson);
  if (invalidVerifyRes.status === 400) {
    console.log("   ✓ Invalid token rejected correctly with 400 status");
  } else {
    throw new Error("Invalid token was not rejected");
  }

  // 4. Verify API with valid token
  console.log(`4. Testing POST /api/verify with valid token: ${token.slice(0, 12)}...`);
  const validVerifyRes = await fetch(`${baseUrl}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  console.log("   Status:", validVerifyRes.status);
  const validVerifyJson = await validVerifyRes.json();
  console.log("   Response:", validVerifyJson);
  if (validVerifyJson.success) {
    console.log("   ✓ Valid token verified account successfully!");
  } else {
    throw new Error("Valid token verification failed");
  }

  // 5. Test Resend for already verified account
  console.log("5. Testing POST /api/resend-verification for verified account");
  const resendRes = await fetch(`${baseUrl}/api/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const resendJson = await resendRes.json();
  console.log("   Status:", resendRes.status, "Response:", resendJson);
  if (resendJson.alreadyVerified) {
    console.log("   ✓ Detected already-verified account correctly!");
  }

  // 6. Test Register & Login HTML Pages
  console.log("6. Testing GET /register, /login, /verify");
  const regPageRes = await fetch(`${baseUrl}/register`);
  const loginPageRes = await fetch(`${baseUrl}/login`);
  const verifyPageRes = await fetch(`${baseUrl}/verify`);
  console.log("   /register status:", regPageRes.status);
  console.log("   /login status:", loginPageRes.status);
  console.log("   /verify status:", verifyPageRes.status);
  if (regPageRes.status === 200 && loginPageRes.status === 200 && verifyPageRes.status === 200) {
    console.log("   ✓ All auth UI routes return HTTP 200 OK");
  } else {
    throw new Error("One or more UI routes failed");
  }

  console.log("\n🎉 ALL END-TO-END VALIDATION TESTS PASSED SUCCESSFULLY! 🎉\n");
}

testE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
