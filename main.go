package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

//go:embed static/*
var staticFiles embed.FS

type apiServer struct{ store *Store }

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func decodeJSON(r *http.Request, dst any) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	return decoder.Decode(dst)
}

func (a *apiServer) login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}
	var input struct{ Username, Password string }
	if err := decodeJSON(r, &input); err != nil {
		writeJSON(w, 400, map[string]string{"error": "dados inválidos"})
		return
	}
	user, ok := authenticate(users, strings.TrimSpace(input.Username), input.Password)
	if !ok {
		writeJSON(w, 401, map[string]string{"error": "usuário ou senha incorretos"})
		return
	}
	writeJSON(w, 200, user)
}

func (a *apiServer) state(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}
	sellers, err := a.store.Read()
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"sellers": sellers, "queue": sortQueue(sellers)})
}

func (a *apiServer) status(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		Username string
		Status   SellerStatus
	}
	if err := decodeJSON(r, &input); err != nil {
		writeJSON(w, 400, map[string]string{"error": "dados inválidos"})
		return
	}
	state, err := a.store.UpdateStatus(input.Username, input.Status)
	if err != nil {
		writeJSON(w, 400, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"sellers": state, "queue": sortQueue(state)})
}

func executableDirectory() string {
	exe, err := os.Executable()
	if err != nil {
		return "."
	}
	return filepath.Dir(exe)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	store := newStore(filepath.Join(executableDirectory(), "data", "state.json"), users)
	api := &apiServer{store: store}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", api.login)
	mux.HandleFunc("/api/state", api.state)
	mux.HandleFunc("/api/status", api.status)
	assets, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/", http.FileServer(http.FS(assets)))

	address := "0.0.0.0:" + port
	fmt.Printf("Mega Feirão Metal Nobre iniciado em http://localhost:%s\n", port)
	fmt.Printf("Na rede local, acesse http://192.168.0.3:%s\n", port)
	log.Fatal(http.ListenAndServe(address, mux))
}
