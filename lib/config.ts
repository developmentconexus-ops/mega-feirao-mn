export type UserRole = "seller" | "reception";

export type AppUser = {
  username: string;
  name: string;
  pin: string;
  role: UserRole;
};

// Edite apenas esta lista para trocar os nomes, usuários e PINs.
export const USERS: AppUser[] = [
  { username: "vendedor1", name: "Vendedor 1", pin: "1111", role: "seller" },
  { username: "vendedor2", name: "Vendedor 2", pin: "2222", role: "seller" },
  { username: "vendedor3", name: "Vendedor 3", pin: "3333", role: "seller" },
  { username: "vendedor4", name: "Vendedor 4", pin: "4444", role: "seller" },
  { username: "vendedor5", name: "Vendedor 5", pin: "5555", role: "seller" },
  { username: "vendedor6", name: "Vendedor 6", pin: "6666", role: "seller" },
  { username: "vendedor7", name: "Vendedor 7", pin: "7777", role: "seller" },
  { username: "vendedor8", name: "Vendedor 8", pin: "8888", role: "seller" },
  { username: "recepcao", name: "Recepção", pin: "9999", role: "reception" }
];
