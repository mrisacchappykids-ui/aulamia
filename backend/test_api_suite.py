import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test():
    results = {}
    print("=== Testing AulaMIA Backend Endpoints ===")

    # 1. Health DB
    try:
        r = requests.get(f"{BASE_URL}/health/db", timeout=5)
        results["/health/db"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["/health/db"] = (False, str(e))

    # 2. List Classrooms
    created_id = None
    try:
        r = requests.get(f"{BASE_URL}/classrooms/", timeout=5)
        results["GET /classrooms/"] = (r.status_code == 200, f"Found {len(r.json())} classrooms")
    except Exception as e:
        results["GET /classrooms/"] = (False, str(e))

    # 3. Create Classroom
    try:
        payload = {
            "name": "GRADO 6 TEST AUTO",
            "grade": "6° de Primaria",
            "subject": "Matemáticas",
            "student_count": 28,
            "average_age": 11,
            "session_duration_minutes": 60,
            "methodology": "Aprendizaje Basado en Proyectos",
            "available_resources": ["Proyector", "Material concreto"],
            "general_learning_pace": "Heterogéneo",
            "inclusion_support_needs": ["Instrucciones paso a paso", "Apoyo visual"],
            "notes": "Prueba de integración automática"
        }
        r = requests.post(f"{BASE_URL}/classrooms/", json=payload, timeout=5)
        if r.status_code == 200:
            created = r.json()
            created_id = created["id"]
            results["POST /classrooms/"] = (True, f"Created ID: {created_id}")
        else:
            results["POST /classrooms/"] = (False, f"Status {r.status_code}: {r.text}")
    except Exception as e:
        results["POST /classrooms/"] = (False, str(e))

    target_classroom_id = created_id or "aula-5to-matematicas"

    # 4. Generate Lesson Plan
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "topic": "Fracciones equivalentes con apoyo manipulativo",
            "learning_objective": "Comprender la equivalencia de fracciones usando regletas de fracciones",
            "specific_competencies": ["Razonamiento lógico-matemático", "Representación gráfica"]
        }
        r = requests.post(f"{BASE_URL}/planner/generate", json=payload, timeout=10)
        results["POST /planner/generate"] = (r.status_code == 200, f"Plan: {r.json().get('title') if r.status_code == 200 else r.text[:80]}")
    except Exception as e:
        results["POST /planner/generate"] = (False, str(e))

    # 5. Generate Activities (4 levels)
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "topic": "Suma de fracciones",
            "learning_objective": "Sumar fracciones homogéneas",
            "include_adaptations": True
        }
        r = requests.post(f"{BASE_URL}/activities/generate", json=payload, timeout=10)
        if r.status_code == 200:
            data = r.json()
            variants = [v["level_name"] for v in data.get("variants", [])]
            results["POST /activities/generate"] = (True, f"Generated levels: {', '.join(variants)}")
        else:
            results["POST /activities/generate"] = (False, r.text[:80])
    except Exception as e:
        results["POST /activities/generate"] = (False, str(e))

    # 6. Generate Evaluations
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "topic": "Fracciones",
            "evaluation_type": "formativa",
            "question_count": 3
        }
        r = requests.post(f"{BASE_URL}/evaluations/generate", json=payload, timeout=10)
        if r.status_code == 200:
            data = r.json()
            results["POST /evaluaciones/generate"] = (True, f"Questions: {len(data.get('quiz_questions', []))}, Rubric criteria: {len(data.get('rubric_criteria', []))}")
        else:
            results["POST /evaluaciones/generate"] = (False, r.text[:80])
    except Exception as e:
        results["POST /evaluaciones/generate"] = (False, str(e))

    # 7. Generate Mini-Game
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "topic": "Fracciones y partes del todo",
            "game_type": "trivia_desafio"
        }
        r = requests.post(f"{BASE_URL}/games/generate", json=payload, timeout=10)
        if r.status_code == 200:
            data = r.json()
            results["POST /games/generate"] = (True, f"Game: {data.get('game_title')} with {len(data.get('items', []))} questions")
        else:
            results["POST /games/generate"] = (False, r.text[:80])
    except Exception as e:
        results["POST /games/generate"] = (False, str(e))

    # 8. Generate Printable Material
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "topic": "Guía práctica de fracciones",
            "learning_objective": "Practicar ejercicios con apoyos visuales"
        }
        r = requests.post(f"{BASE_URL}/materials/generate", json=payload, timeout=10)
        if r.status_code == 200:
            data = r.json()
            results["POST /materials/generate"] = (True, f"Material: {data.get('title')} ({len(data.get('sections', []))} sections)")
        else:
            results["POST /materials/generate"] = (False, r.text[:80])
    except Exception as e:
        results["POST /materials/generate"] = (False, str(e))

    # 9. Adapt external content
    try:
        payload = {
            "classroom_id": target_classroom_id,
            "original_prompt": "Lea el texto de la página 45 sobre ecosistemas y responda las 10 preguntas al final del capítulo en silencio.",
            "target_objective": "Adaptar para estudiantes con ritmo visual y necesidad de trabajo colaborativo"
        }
        r = requests.post(f"{BASE_URL}/adaptations/adapt", json=payload, timeout=10)
        if r.status_code == 200:
            data = r.json()
            results["POST /adaptations/adapt"] = (True, f"Adapted: {data.get('adapted_title')}")
        else:
            results["POST /adaptations/adapt"] = (False, r.text[:80])
    except Exception as e:
        results["POST /adaptations/adapt"] = (False, str(e))

    # 10. Resources list and stats
    try:
        r = requests.get(f"{BASE_URL}/resources/", timeout=5)
        count = len(r.json()) if r.status_code == 200 else 0
        results["GET /resources/"] = (r.status_code == 200, f"{count} resources stored")
    except Exception as e:
        results["GET /resources/"] = (False, str(e))

    try:
        r = requests.get(f"{BASE_URL}/resources/stats", timeout=5)
        results["GET /resources/stats"] = (r.status_code == 200, str(r.json()))
    except Exception as e:
        results["GET /resources/stats"] = (False, str(e))

    # 11. Auth endpoints
    try:
        r = requests.get(f"{BASE_URL}/auth/demo-login", timeout=5)
        results["GET /auth/demo-login"] = (r.status_code == 200, f"Demo user: {r.json().get('user', {}).get('name') if r.status_code == 200 else r.text}")
    except Exception as e:
        results["GET /auth/demo-login"] = (False, str(e))

    try:
        auth_payload = {
            "name": "Docente Test Auto",
            "email": f"test_auto_{target_classroom_id}@aulamia.edu",
            "password": "Password123!",
            "institution": "Colegio Nacional",
            "specialty": "Primaria"
        }
        r = requests.post(f"{BASE_URL}/auth/register", json=auth_payload, timeout=5)
        results["POST /auth/register"] = (r.status_code in (200, 201), f"Registered: {r.json().get('user', {}).get('email') if r.status_code in (200, 201) else r.text[:80]}")
    except Exception as e:
        results["POST /auth/register"] = (False, str(e))

    # Print summary
    print("\n=== TEST RESULTS SUMMARY ===")
    all_passed = True
    for ep, (passed, info) in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        if not passed:
            all_passed = False
        print(f"{status} | {ep}: {info}")

    return all_passed

if __name__ == "__main__":
    success = test()
    sys.exit(0 if success else 1)
