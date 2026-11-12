"""Integration tests against an isolated copy with local SQLite and template generation."""
import hashlib
import json
import os
import shutil
import socket
import sys
import threading
import time
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import requests
import uvicorn

BACKEND = Path(__file__).resolve().parent


class AulaMIAIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        directory = cls.enterClassContext(TemporaryDirectory(prefix="aulamia-test-"))
        isolated = Path(directory)
        shutil.copytree(BACKEND / "app", isolated / "app", ignore=shutil.ignore_patterns("__pycache__"))
        cls.enterClassContext(patch.dict(os.environ, clear=True))
        cls.enterClassContext(patch.object(sys, "path", [directory, *sys.path]))
        from app.core import database
        from app.main import app
        from app.services import auth_storage

        cls.database = database
        cls.auth_storage = auth_storage
        cls.addClassCleanup(cls.reopen_database)

        data_dir = isolated / "data"
        data_dir.mkdir()
        digest, salt = auth_storage.hash_password("contraseña-prueba")
        (data_dir / "users.json").write_text(json.dumps([{
            "id": "usr-legacy-fixture",
            "name": "Docente de prueba anterior",
            "email": "legacy@example.test",
            "password_hash": digest,
            "salt": salt,
            "institution": "AulaMIA Pruebas",
            "specialty": "Primaria",
            "role": "Docente",
            "created_at": "2026-01-01T00:00:00",
        }]), encoding="utf-8")
        cls.legacy_file = data_dir / "users.json"
        cls.legacy_data_hash = hashlib.sha256(cls.legacy_file.read_bytes()).digest()

        listener = cls.enterClassContext(socket.socket())
        listener.bind(("127.0.0.1", 0))
        cls.api = f"http://127.0.0.1:{listener.getsockname()[1]}"
        server = uvicorn.Server(uvicorn.Config(app, log_level="warning"))
        worker = threading.Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
        worker.start()
        cls.addClassCleanup(cls.stop_server, server, worker)
        deadline = time.monotonic() + 8
        while not server.started:
            if not worker.is_alive() or time.monotonic() >= deadline:
                raise RuntimeError("No se pudo iniciar la API de prueba.")
            time.sleep(0.05)

    @staticmethod
    def stop_server(server, worker):
        server.should_exit = True
        worker.join(timeout=8)

    @classmethod
    def reopen_database(cls):
        if cls.database.engine:
            cls.database.engine.dispose()
        cls.database.engine = None
        cls.database.SessionLocal = None

    def request(self, method, path, expected=200, **kwargs):
        response = requests.request(method, self.api + path, timeout=8, **kwargs)
        self.assertEqual(response.status_code, expected, f"{method} {path}: {response.text[:400]}")
        return None if expected == 204 else response.json()

    def test_login_register_migrate_logout(self):
        legacy = {"email": "legacy@example.test", "password": "contraseña-prueba"}
        migrated = self.request("POST", "/auth/login", json=legacy)
        self.assertEqual(migrated["user"]["id"], "usr-legacy-fixture")
        self.assertEqual(hashlib.sha256(self.legacy_file.read_bytes()).digest(), self.legacy_data_hash)

        credentials = {"email": "docente@example.test", "password": "contraseña-prueba"}
        registration = {"name": "Docente de prueba", **credentials}
        registered = self.request("POST", "/auth/register", 201, json=registration)
        self.request("POST", "/auth/register", 400, json=registration)
        self.request("POST", "/auth/login", 401, json={**credentials, "password": "incorrecta"})
        self.reopen_database()
        authenticated = self.request("POST", "/auth/login", json=credentials)
        self.assertEqual(registered["user"]["id"], authenticated["user"]["id"])

        headers = {"Authorization": f"Bearer {authenticated['token']}"}
        self.assertEqual(self.request("GET", "/auth/me", headers=headers), registered["user"])
        self.request("POST", "/auth/logout", 204, headers=headers)
        self.request("GET", "/auth/me", 401, headers=headers)
        demo = self.request("GET", "/auth/demo-login")
        self.assertEqual(demo["user"]["id"], "usr-demo-docente")
        self.request("POST", "/auth/google", 422, json={"email": "docente@example.test"})
        self.request("POST", "/auth/google", 503, json={"credential": "fixture-sin-configuracion"})

    def test_classroom_and_all_generators(self):
        profile = {
            "name": "Aula de prueba", "grade": "6° de Primaria", "subject": "Matemáticas",
            "methodology": "Aprendizaje Basado en Proyectos", "session_duration_minutes": 60,
            "inclusion_support_needs": ["Instrucciones paso a paso"],
        }
        classroom = self.request("POST", "/classrooms/", json=profile)
        classroom_id = classroom["id"]
        self.reopen_database()
        self.assertEqual(self.request("GET", f"/classrooms/{classroom_id}"), classroom)
        self.assertIn(classroom_id, [item["id"] for item in self.request("GET", "/classrooms/")])

        context = {"classroom_id": classroom_id, "topic": "Fracciones"}
        plan = self.request("POST", "/planner/generate", json={
            **context, "learning_objective": "Representar fracciones equivalentes",
        })
        self.assertEqual(plan["classroom_id"], classroom_id)
        self.assertEqual(sum(phase["duration_minutes"] for phase in plan["phases"]), 60)
        self.reopen_database()
        resources = self.request("GET", "/resources/?resource_type=lesson_plan")
        self.assertIn(plan["id"], [item["id"] for item in resources])

        activities = self.request("POST", "/activities/generate", json=context)
        for name in ("base_activity", "reinforcement_activity", "deepening_activity", "adapted_activity"):
            self.assertTrue(activities[name]["step_by_step_instructions"])
        evaluation = self.request("POST", "/evaluations/generate", json={**context, "question_count": 3})
        self.assertTrue(evaluation["questions"])
        self.assertTrue(evaluation["rubric"])
        game = self.request("POST", "/games/generate", json={**context, "game_style": "desafio_relampago"})
        self.assertEqual(game["game_style"], "desafio_relampago")
        self.assertTrue(game["items"])
        material = self.request("POST", "/materials/generate", json={**context, "material_type": "guia_taller"})
        self.assertTrue(material["sections"])
        adaptation = self.request("POST", "/adaptations/adapt", json={
            "classroom_id": classroom_id, "original_title": "Fracciones equivalentes",
            "original_content": "Representa las fracciones con regletas.",
            "target_barrier": "Apoyo visual",
        })
        self.assertTrue(adaptation["simplified_instructions"])
        self.request("POST", "/resources/feedback", json={
            "resource_id": plan["id"], "stars": 4, "relevance_rating": 5,
            "estimated_minutes_saved": 30,
        })
        stats = self.request("GET", "/resources/stats")
        self.assertEqual(stats["plans_count"], 1)
        self.assertEqual(stats["average_pedagogical_rating"], 4)
        self.request("DELETE", f"/resources/{plan['id']}")
        self.request("DELETE", f"/classrooms/{classroom_id}")
        self.request("GET", f"/classrooms/{classroom_id}", 404)

    def test_storage_failure_returns_503(self):
        self.reopen_database()
        with patch.object(self.database, "SERVERLESS", True):
            status = self.request("GET", "/health/db", 503)
            self.assertEqual(status, {"mode": "unavailable", "postgres_connected": False})
            self.request("POST", "/classrooms/", 503, json={
                "name": "Aula de prueba", "grade": "6°", "subject": "Matemáticas",
            })
            self.request("GET", "/auth/demo-login", 503)
        self.assertEqual(self.request("GET", "/health/db")["mode"], "sqlite")

    def test_google_identity_keeps_the_same_account(self):
        identity = {"sub": "google-test-subject", "email": "docente-google@gmail.com", "name": "Docente de prueba"}
        with patch.object(self.auth_storage, "_google_identity", return_value=identity):
            first = self.request("POST", "/auth/google", json={"credential": "google-test"})
            self.reopen_database()
            second = self.request("POST", "/auth/google", json={"credential": "google-test"})
        self.assertEqual(first["user"]["id"], second["user"]["id"])
        self.assertEqual(first["user"]["email"], identity["email"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
