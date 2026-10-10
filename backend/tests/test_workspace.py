"""One inbox per tester: X-Workspace keeps stores apart; the example inbox is copied in on request."""

from fastapi.testclient import TestClient

import main
import store


def test_workspaces_are_separate_and_example_copies(tmp_path, monkeypatch):
    monkeypatch.setattr(store, "PATH", tmp_path / "store.json")
    store.WORKSPACE.set("example")
    co = store.resolve_company("Acme AI", "acme-ai.example")
    store.add_item(co["id"], "pdf", "deck.pdf", None, [])
    store.WORKSPACE.set("default")

    client = TestClient(main.app)
    alice, bob = {"X-Workspace": "alice-1"}, {"X-Workspace": "bob-2"}
    assert client.get("/companies", headers=alice).json() == []
    assert client.post("/workspace/example", headers=alice).json()["companies"] == 1
    assert [c["name"] for c in client.get("/companies", headers=alice).json()] == ["Acme AI"]
    assert client.get("/companies", headers=bob).json() == []        # bob doesn't see alice's inbox
    assert client.get("/companies").json() == []                      # nor does the shared default inbox
    assert client.get("/companies", headers={"X-Workspace": "../etc"}).json() == []  # bad ids fall back to default
    assert client.post("/workspace/example").status_code == 400       # never overwrite the shared inbox
    assert (tmp_path / "ws" / "alice-1.json").exists()
