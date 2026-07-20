package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type SellerStatus string

const (
	StatusAvailable SellerStatus = "available"
	StatusBusy      SellerStatus = "busy"
)

type SellerState struct {
	Username       string       `json:"username"`
	Name           string       `json:"name"`
	Status         SellerStatus `json:"status"`
	AvailableSince *time.Time   `json:"availableSince"`
	UpdatedAt      time.Time    `json:"updatedAt"`
}

type Store struct {
	mu    sync.Mutex
	path  string
	users []User
	now   func() time.Time
}

func newStore(path string, users []User) *Store {
	return &Store{path: path, users: users, now: time.Now}
}

func (s *Store) initialState() []SellerState {
	now := s.now().UTC()
	result := make([]SellerState, 0)
	for _, user := range s.users {
		if user.Role == RoleSeller {
			result = append(result, SellerState{Username: user.Username, Name: user.Name, Status: StatusBusy, UpdatedAt: now})
		}
	}
	return result
}

func (s *Store) readUnlocked() ([]SellerState, error) {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return nil, err
	}
	raw, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		state := s.initialState()
		if err := s.writeUnlocked(state); err != nil {
			return nil, err
		}
		return state, nil
	}
	if err != nil {
		return nil, err
	}
	var saved []SellerState
	if err := json.Unmarshal(raw, &saved); err != nil {
		return nil, err
	}
	byUsername := make(map[string]SellerState, len(saved))
	for _, seller := range saved {
		byUsername[seller.Username] = seller
	}
	now := s.now().UTC()
	result := make([]SellerState, 0)
	for _, user := range s.users {
		if user.Role != RoleSeller {
			continue
		}
		if current, ok := byUsername[user.Username]; ok {
			current.Name = user.Name
			result = append(result, current)
		} else {
			result = append(result, SellerState{Username: user.Username, Name: user.Name, Status: StatusBusy, UpdatedAt: now})
		}
	}
	return result, nil
}

func (s *Store) writeUnlocked(state []SellerState) error {
	raw, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, raw, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func (s *Store) Read() ([]SellerState, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.readUnlocked()
}

func (s *Store) UpdateStatus(username string, status SellerStatus) ([]SellerState, error) {
	if status != StatusAvailable && status != StatusBusy {
		return nil, errors.New("status inválido")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	state, err := s.readUnlocked()
	if err != nil {
		return nil, err
	}
	now := s.now().UTC()
	found := false
	for i := range state {
		if state[i].Username != username {
			continue
		}
		found = true
		state[i].Status = status
		state[i].UpdatedAt = now
		if status == StatusAvailable {
			available := now
			state[i].AvailableSince = &available
		} else {
			state[i].AvailableSince = nil
		}
	}
	if !found {
		return nil, errors.New("vendedor não encontrado")
	}
	if err := s.writeUnlocked(state); err != nil {
		return nil, err
	}
	return state, nil
}

func sortQueue(sellers []SellerState) []SellerState {
	queue := make([]SellerState, 0)
	for _, seller := range sellers {
		if seller.Status == StatusAvailable {
			queue = append(queue, seller)
		}
	}
	sort.SliceStable(queue, func(i, j int) bool {
		if queue[i].AvailableSince == nil {
			return false
		}
		if queue[j].AvailableSince == nil {
			return true
		}
		return queue[i].AvailableSince.Before(*queue[j].AvailableSince)
	})
	return queue
}

func (s *Store) Queue() ([]SellerState, error) {
	state, err := s.Read()
	if err != nil {
		return nil, err
	}
	return sortQueue(state), nil
}
