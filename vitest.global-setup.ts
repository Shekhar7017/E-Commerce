import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | undefined;

export async function setup() {
  mongod = await MongoMemoryServer.create();
  // lib/db.ts reads MONGODB_URI at module import time, so this must be set
  // before any integration test file (and therefore any service module)
  // is loaded. Vitest's globalSetup runs before test files are collected,
  // and process.env mutations made here are forwarded to the test workers.
  process.env.MONGODB_URI = mongod.getUri();
}

export async function teardown() {
  if (mongod) {
    await mongod.stop();
  }
}
