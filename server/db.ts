import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

dotenv.config();

const poolConnection = mysql.createPool({
  host: 'localhost',
  user: 'codespace',
  password: 'codespace',
  database: 'gorkem2',
  port: 3306
});

export const db = drizzle(poolConnection, { mode: 'default', schema });