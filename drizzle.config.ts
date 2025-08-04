import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "localhost",
    port: 3306,
    user: "codespace",
    password: "codespace",
    database: "gorkem2",
  },
});
