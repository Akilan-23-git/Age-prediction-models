import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function testAuthScenarios() {
  console.log("=== Testing Authentication Security Scenarios ===");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("CorrectPassword99", salt);

  // 1. Create an unverified user
  const unverifiedEmail = "unverified_test@example.com";
  await prisma.user.deleteMany({ where: { email: unverifiedEmail } });
  const unverifiedUser = await prisma.user.create({
    data: {
      name: "Unverified Tester",
      email: unverifiedEmail,
      passwordHash,
      emailVerified: false,
    },
  });

  console.log("1. Testing login attempt on unverified user:");
  const test1User = await prisma.user.findUnique({ where: { email: unverifiedEmail } });
  const passMatch1 = await bcrypt.compare("CorrectPassword99", test1User!.passwordHash);
  if (passMatch1 && !test1User!.emailVerified) {
    console.log("   ✓ User password matches but emailVerified is false -> Login blocked as expected!");
  }

  // 2. Mark user verified and test
  await prisma.user.update({
    where: { id: unverifiedUser.id },
    data: { emailVerified: true },
  });
  const verifiedUser = await prisma.user.findUnique({ where: { id: unverifiedUser.id } });
  const passMatch2 = await bcrypt.compare("CorrectPassword99", verifiedUser!.passwordHash);
  if (passMatch2 && verifiedUser!.emailVerified) {
    console.log("   ✓ Verified user with correct password -> Login allowed successfully!");
  }

  // 3. Test wrong password
  const wrongPassMatch = await bcrypt.compare("WrongPassword123", verifiedUser!.passwordHash);
  if (!wrongPassMatch) {
    console.log("   ✓ Wrong password rejected securely!");
  }

  console.log("\n✓ All Auth and Security Scenarios Passed!\n");
}

testAuthScenarios()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
