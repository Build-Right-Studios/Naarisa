// Admin account management from the command line (needs MONGO_URI in Backend/.env).
//
//   npm run admins -- list
//   npm run admins -- create "Full Name" admin@example.com      (prompts for the password)
//   npm run admins -- delete admin@example.com
//
// POST /api/auth/signup is admin-only, so use `create` to bootstrap the first admin.
import "dotenv/config";
import readline from "node:readline";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Admin } from "../MongoDB/models.js";

const promptHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.stdoutMuted = false;
    rl._writeToOutput = (str) => {
      if (!rl.stdoutMuted) rl.output.write(str);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl.stdoutMuted = true;
  });

const list = async () => {
  const admins = await Admin.find({}, { name: 1, email: 1 }).lean();
  console.log(`${admins.length} admin account(s):`);
  for (const a of admins) {
    console.log(`  ${a.email}\t${a.name}\tcreated ${a._id.getTimestamp().toISOString()}`);
  }
};

const create = async (name, email) => {
  if (!name || !email) throw new Error('Usage: npm run admins -- create "Full Name" email@example.com');
  email = email.trim().toLowerCase();
  if (await Admin.exists({ email })) throw new Error(`Admin ${email} already exists`);

  const password = await promptHidden("Password (min 12 chars): ");
  if (password.length < 12) throw new Error("Password must be at least 12 characters");
  const confirm = await promptHidden("Confirm password: ");
  if (password !== confirm) throw new Error("Passwords do not match");

  await Admin.create({ name, email, password: await bcrypt.hash(password, 10) });
  console.log(`Created admin ${email}`);
};

const remove = async (email) => {
  if (!email) throw new Error("Usage: npm run admins -- delete email@example.com");
  const { deletedCount } = await Admin.deleteOne({ email: { $in: [email.trim(), email.trim().toLowerCase()] } });
  console.log(deletedCount ? `Deleted admin ${email}` : `No admin with email ${email}`);
};

const [command, ...args] = process.argv.slice(2);
const commands = { list, create, delete: remove };

if (!commands[command]) {
  console.error("Usage: npm run admins -- <list | create \"Name\" email | delete email>");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set (add it to Backend/.env)");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  await commands[command](...args);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
