export type UserRole = "seller" | "reception" | "viewer";

export type AppUser = {
  username: string;
  name: string;
  pin: string;
  role: UserRole;
};

// Edite apenas esta lista para trocar os nomes, usuários e senhas.
export const USERS: AppUser[] = [
  { username: "oscar", name: "Oscar", pin: "oscarMN", role: "seller" },
  { username: "francyelle", name: "Francyelle", pin: "franMN", role: "seller" },
  { username: "keila", name: "Keila", pin: "keilaMN", role: "seller" },
  { username: "beatriz", name: "Beatriz", pin: "beatrizMN", role: "seller" },
  { username: "raphael", name: "Raphael", pin: "raphaelMN", role: "seller" },
  { username: "joao", name: "João", pin: "joaoMN", role: "seller" },
  { username: "jose", name: "Jose", pin: "joseMN", role: "seller" },
  { username: "daniel", name: "Daniel", pin: "danielMN", role: "seller" },
  { username: "leandro", name: "Leandro", pin: "leandroMN", role: "seller" },
  { username: "izabel", name: "Izabel", pin: "izabelMN", role: "seller" },

  { username: "thassya", name: "Thassya", pin: "thassyaMN", role: "reception" },
  { username: "sthella", name: "Sthella", pin: "SthellaMN", role: "reception" },

  { username: "leandrot", name: "Leandro T", pin: "leandrotMN", role: "viewer" },
  { username: "viniciust", name: "Vinicius T", pin: "viniciustMN", role: "viewer" },
  { username: "mauro", name: "Mauro", pin: "mauroMN", role: "viewer" },
  { username: "vinicius", name: "Vinicius", pin: "viniciusMN", role: "viewer" }
];