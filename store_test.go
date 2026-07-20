package main

import (
	"path/filepath"
	"testing"
	"time"
)

func testUsers() []User {
	return []User{
		{Username: "ana", Name: "Ana", Password: "anaMN", Role: RoleSeller},
		{Username: "bia", Name: "Bia", Password: "biaMN", Role: RoleSeller},
		{Username: "recepcao", Name: "Recepção", Password: "rMN", Role: RoleReception},
		{Username: "viewer", Name: "Viewer", Password: "vMN", Role: RoleViewer},
	}
}

func TestAuthenticateReturnsMatchingRole(t *testing.T) {
	user, ok := authenticate(testUsers(), "viewer", "vMN")
	if !ok || user.Role != RoleViewer {
		t.Fatalf("expected viewer login, got %#v, %v", user, ok)
	}
	if _, ok := authenticate(testUsers(), "viewer", "wrong"); ok {
		t.Fatal("wrong password must not authenticate")
	}
}

func TestAvailableSellerReturnsToEndOfQueue(t *testing.T) {
	store := newStore(filepath.Join(t.TempDir(), "state.json"), testUsers())
	base := time.Date(2026, 7, 20, 12, 0, 0, 0, time.UTC)
	store.now = func() time.Time { return base }

	if _, err := store.UpdateStatus("ana", StatusAvailable); err != nil {
		t.Fatal(err)
	}
	store.now = func() time.Time { return base.Add(time.Minute) }
	if _, err := store.UpdateStatus("bia", StatusAvailable); err != nil {
		t.Fatal(err)
	}

	queue, err := store.Queue()
	if err != nil {
		t.Fatal(err)
	}
	if len(queue) != 2 || queue[0].Username != "ana" || queue[1].Username != "bia" {
		t.Fatalf("unexpected initial queue: %#v", queue)
	}

	if _, err := store.UpdateStatus("ana", StatusBusy); err != nil {
		t.Fatal(err)
	}
	store.now = func() time.Time { return base.Add(2 * time.Minute) }
	if _, err := store.UpdateStatus("ana", StatusAvailable); err != nil {
		t.Fatal(err)
	}

	queue, err = store.Queue()
	if err != nil {
		t.Fatal(err)
	}
	if queue[0].Username != "bia" || queue[1].Username != "ana" {
		t.Fatalf("seller should return to end: %#v", queue)
	}
}

func TestStateContainsOnlyConfiguredSellers(t *testing.T) {
	store := newStore(filepath.Join(t.TempDir(), "state.json"), testUsers())
	sellers, err := store.Read()
	if err != nil {
		t.Fatal(err)
	}
	if len(sellers) != 2 {
		t.Fatalf("expected 2 sellers, got %d", len(sellers))
	}
	for _, seller := range sellers {
		if seller.Username == "recepcao" || seller.Username == "viewer" {
			t.Fatalf("non-seller leaked into state: %#v", seller)
		}
	}
}
