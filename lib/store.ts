import { promises as fs } from "fs";
import path from "path";
import { USERS } from "./config";

export type SellerStatus = "available" | "busy";
export type SellerState = {
  username: string;
  name: string;
  status: SellerStatus;
  availableSince: string | null;
  updatedAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const stateFile = path.join(dataDirectory, "state.json");
let writeQueue: Promise<void> = Promise.resolve();

function initialState(): SellerState[] {
  const now = new Date().toISOString();
  return USERS.filter((user) => user.role === "seller").map((user) => ({
    username: user.username,
    name: user.name,
    status: "busy",
    availableSince: null,
    updatedAt: now
  }));
}

async function ensureStateFile(): Promise<void> {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(stateFile);
  } catch {
    await fs.writeFile(stateFile, JSON.stringify(initialState(), null, 2), "utf8");
  }
}

export async function readState(): Promise<SellerState[]> {
  await ensureStateFile();
  const raw = await fs.readFile(stateFile, "utf8");
  const saved = JSON.parse(raw) as SellerState[];
  const byUsername = new Map(saved.map((seller) => [seller.username, seller]));
  const now = new Date().toISOString();

  return USERS.filter((user) => user.role === "seller").map((user) => {
    const current = byUsername.get(user.username);
    return current
      ? { ...current, name: user.name }
      : { username: user.username, name: user.name, status: "busy", availableSince: null, updatedAt: now };
  });
}

export async function updateSellerStatus(username: string, status: SellerStatus): Promise<SellerState[]> {
  let result: SellerState[] = [];
  writeQueue = writeQueue.then(async () => {
    const sellers = await readState();
    const now = new Date().toISOString();
    let found = false;
    result = sellers.map((seller) => {
      if (seller.username !== username) return seller;
      found = true;
      return {
        ...seller,
        status,
        availableSince: status === "available" ? now : null,
        updatedAt: now
      };
    });
    if (!found) throw new Error("Vendedor não encontrado");
    await fs.writeFile(stateFile, JSON.stringify(result, null, 2), "utf8");
  });
  await writeQueue;
  return result;
}

export function sortQueue(sellers: SellerState[]): SellerState[] {
  return sellers
    .filter((seller) => seller.status === "available")
    .sort((a, b) => (a.availableSince ?? "").localeCompare(b.availableSince ?? ""));
}
