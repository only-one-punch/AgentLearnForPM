import { auth } from "../lib/auth/auth";
import { runMigrations } from "../lib/db/migrate";

const email = process.env.PRIMARY_USER_EMAIL ?? process.env.WORKBENCH_PRIMARY_EMAIL;
const password = process.env.PRIMARY_USER_PASSWORD ?? process.env.WORKBENCH_PRIMARY_PASSWORD;
const name = process.env.PRIMARY_USER_NAME ?? process.env.WORKBENCH_PRIMARY_NAME ?? "Agent PM";

if (!email || !password) {
  console.error(
    "Missing PRIMARY_USER_EMAIL/PRIMARY_USER_PASSWORD. Refusing to create a default account."
  );
  process.exit(1);
}

runMigrations();

try {
  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name
    }
  });
  console.log(`Seeded primary workbench user: ${email}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/already|exists|duplicate|unique/i.test(message)) {
    console.log(`Primary workbench user already exists: ${email}`);
  } else {
    throw error;
  }
}
