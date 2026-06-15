import process from "node:process";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI,
    mongodbDb: process.env.MONGODB_DB,
  };
}