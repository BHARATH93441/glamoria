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

function getDbName() {
  return getServerConfig().mongodbDb || "glamora";
}

async function getUsersCollection() {
  if (!usersCollectionPromise) {
    usersCollectionPromise = (async () => {
      const { mongodbUri } = getServerConfig();
      if (!mongodbUri) {
        throw new Error("Missing MONGODB_URI environment variable");
      }

      if (!clientPromise) {
        clientPromise = new MongoClient(mongodbUri).connect();
      }

      const client = await clientPromise;
      const collection = client.db(getDbName()).collection<UserDocument>("users");
      await collection.createIndex({ email: 1 }, { unique: true });
      return collection;
    })();
  }

  return usersCollectionPromise;
}

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