"""
Main entry point for SUIS Backend

Runs multiple APIs simultaneously:

* Career Prediction API (8000)
* Spam Detection API (5000)
* Workload API (8001)
* SUIS SEGA Emergency API (8003)
* SUIS Auth API (8004)
"""

import sys
import time
from multiprocessing import Process
import uvicorn

# ================= IMPORT ALL APPS =================

from app import app as career_app
from spam_detection import app as spam_app
from workload import app as workload_app
from SEGA.server import app as emergency_app
from auth_api import app as auth_app

# ===================================================
# ================= RUNNERS =========================
# ===================================================

def run_career_api():
    print("🚀 Starting Career Prediction API on port 8000...")
    uvicorn.run(career_app, host="127.0.0.1", port=8000, log_level="info")


def run_spam_api():
    print("🚀 Starting Spam Detection API on port 5000...")
    uvicorn.run(spam_app, host="127.0.0.1", port=5000, log_level="info")


def run_workload_api():
    print("🚀 Starting Workload API on port 8001...")
    uvicorn.run(workload_app, host="127.0.0.1", port=8001, log_level="info")


def run_emergency_api():
    print("🚨 Starting SUIS SEGA Emergency API on port 8003...")
    uvicorn.run(emergency_app, host="127.0.0.1", port=8003, log_level="info")


def run_auth_api():
    print("🔐 Starting SUIS Auth & User API on port 8004...")
    uvicorn.run(auth_app, host="127.0.0.1", port=8004, log_level="info")


# ===================================================
# ================= MAIN ============================
# ===================================================

if __name__ == "__main__":

    print("=" * 70)
    print("SUIS Backend - Multi Service Engine")
    print("=" * 70)
    print("Career API   → http://127.0.0.1:8000")
    print("Spam API     → http://127.0.0.1:5000")
    print("Workload API → http://127.0.0.1:8001")
    print("SEGA API     → http://127.0.0.1:8003")
    print("Auth API     → http://127.0.0.1:8004")
    print("=" * 70)

    career_process = Process(target=run_career_api)
    spam_process = Process(target=run_spam_api)
    workload_process = Process(target=run_workload_api)
    emergency_process = Process(target=run_emergency_api)
    auth_process = Process(target=run_auth_api)

    try:
        career_process.start()
        time.sleep(1)

        spam_process.start()
        time.sleep(1)

        workload_process.start()
        time.sleep(1)

        emergency_process.start()
        time.sleep(1)

        auth_process.start()

        print("\n✅ All SUIS services are running — press CTRL+C to stop\n")

        career_process.join()
        spam_process.join()
        workload_process.join()
        emergency_process.join()
        auth_process.join()

    except KeyboardInterrupt:
        print("\n🛑 Shutting down SUIS services...")

        career_process.terminate()
        spam_process.terminate()
        workload_process.terminate()
        emergency_process.terminate()
        auth_process.terminate()

        sys.exit(0)