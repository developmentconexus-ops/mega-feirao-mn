package main

type Role string

const (
	RoleSeller    Role = "seller"
	RoleReception Role = "reception"
	RoleViewer    Role = "viewer"
)

type User struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Password string `json:"-"`
	Role     Role   `json:"role"`
}

var users = []User{
	{Username: "oscar", Name: "Oscar", Password: "oscarMN", Role: RoleSeller},
	{Username: "francyelle", Name: "Francyelle", Password: "franMN", Role: RoleSeller},
	{Username: "keila", Name: "Keila", Password: "keilaMN", Role: RoleSeller},
	{Username: "beatriz", Name: "Beatriz", Password: "beatrizMN", Role: RoleSeller},
	{Username: "raphael", Name: "Raphael", Password: "raphaelMN", Role: RoleSeller},
	{Username: "joao", Name: "João", Password: "joaoMN", Role: RoleSeller},
	{Username: "jose", Name: "Jose", Password: "joseMN", Role: RoleSeller},
	{Username: "daniel", Name: "Daniel", Password: "danielMN", Role: RoleSeller},
	{Username: "leandro", Name: "Leandro", Password: "leandroMN", Role: RoleSeller},
	{Username: "izabel", Name: "Izabel", Password: "izabelMN", Role: RoleSeller},
	{Username: "thassya", Name: "Thassya", Password: "thassyaMN", Role: RoleReception},
	{Username: "sthella", Name: "Sthella", Password: "SthellaMN", Role: RoleReception},
	{Username: "leandrot", Name: "Leandro T", Password: "leandrotMN", Role: RoleViewer},
	{Username: "viniciust", Name: "Vinicius T", Password: "viniciustMN", Role: RoleViewer},
	{Username: "mauro", Name: "Mauro", Password: "mauroMN", Role: RoleViewer},
	{Username: "vinicius", Name: "Vinicius", Password: "viniciusMN", Role: RoleViewer},
}

func authenticate(all []User, username, password string) (User, bool) {
	for _, user := range all {
		if user.Username == username && user.Password == password {
			return user, true
		}
	}
	return User{}, false
}
