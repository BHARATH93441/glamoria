import { MongoClient, type Collection } from "mongodb";
import bcrypt from "bcryptjs";

import { getServerConfig } from "./config.server";

export type AuthUser = {
  name: string;
  email: string;
};

type UserDocument = AuthUser & {
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

let clientPromise: Promise<MongoClient> | undefined;
let usersCollectionPromise: Promise<Collection<UserDocument>> | undefined;
let hasLoggedMongoConnection = false;

function getDbName() {
  return getServerConfig().mongodbDb || "glamora";
}

function redactMongoUri(uri: string) {
  try {
    const parsed = new URL(uri);
    if (parsed.username || parsed.password) {
      parsed.username = parsed.username ? "***" : "";
      parsed.password = parsed.password ? "***" : "";
    }
    return parsed.toString();
  } catch {
    return uri.replace(/:\/\/[^@]+@/, "://***:***@");
  }
}

function logMongoConnectionFailure(error: unknown) {
  if (error && typeof error === "object") {
    const mongoError = error as {
      message?: string;
      code?: string | number;
      syscall?: string;
      hostname?: string;
    };

    console.error("MongoDB connection failed", {
      db: getDbName(),
      code: mongoError.code,
      syscall: mongoError.syscall,
      hostname: mongoError.hostname,
      message: mongoError.message,
    });
    return;
  }

  console.error("MongoDB connection failed", { db: getDbName(), error });
}

async function getUsersCollection() {
  if (!usersCollectionPromise) {
    usersCollectionPromise = (async () => {
      const { mongodbUri } = getServerConfig();
      if (!mongodbUri) {
        throw new Error("Missing MONGODB_URI environment variable");
      }

      console.log("MongoDB connecting", {
        db: getDbName(),
        uri: redactMongoUri(mongodbUri),
      });

      if (!clientPromise) {
        clientPromise = new MongoClient(mongodbUri).connect();
      }

      const client = await clientPromise;
      const collection = client.db(getDbName()).collection<UserDocument>("users");
      await collection.createIndex({ email: 1 }, { unique: true });
      if (!hasLoggedMongoConnection) {
        console.log("MongoDB connected", {
          db: client.db(getDbName()).databaseName,
        });
        hasLoggedMongoConnection = true;
      }
      return collection;
    })();

    usersCollectionPromise.catch((error) => {
      logMongoConnectionFailure(error);
    });
  }

  return usersCollectionPromise;
}

void getUsersCollection()
  .then(() => {
    if (!hasLoggedMongoConnection) {
      console.log("MongoDB connected", { db: getDbName() });
      hasLoggedMongoConnection = true;
    }
  })
  .catch((error) => {
    logMongoConnectionFailure(error);
  });

export async function registerAuthUser(input: { name: string; email: string; password: string }): Promise<AuthUser> {
  const collection = await getUsersCollection();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const existing = await collection.findOne({ email });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const now = new Date();

  await collection.insertOne({
    name,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  return { name, email };
}

export async function loginAuthUser(input: { email: string; password: string }): Promise<AuthUser> {
  const collection = await getUsersCollection();
  const email = input.email.trim().toLowerCase();

  const user = await collection.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) {
    throw new Error("Invalid email or password");
  }

  return { name: user.name, email: user.email };
}