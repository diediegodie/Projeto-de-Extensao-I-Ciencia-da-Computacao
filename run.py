import os
from pathlib import Path
import subprocess
import sys

SITE_DIR = Path(__file__).resolve().parent
VENV_DIR = SITE_DIR / ".venv"
REQUIREMENTS = SITE_DIR / "requirements.txt"

if os.name == "nt":
    VENV_PYTHON = VENV_DIR / "Scripts" / "python.exe"
else:
    VENV_PYTHON = VENV_DIR / "bin" / "python"


def run(command):
    subprocess.run(
        [str(argument) for argument in command],
        cwd=SITE_DIR,
        check=True,
    )


def main():
    if not VENV_PYTHON.exists():
        run([sys.executable, "-m", "venv", VENV_DIR])

    try:
        run([VENV_PYTHON, "-c", "import flask"])
    except subprocess.CalledProcessError:
        run([VENV_PYTHON, "-m", "pip", "install", "-r", REQUIREMENTS])

    print("Site disponível em http://0.0.0.0:5000/ (Ctrl+C para parar)")
    run([
        VENV_PYTHON, "-m", "flask",
        "--app", "backend",
        "run",
        "--host", "0.0.0.0",
        "--port", "5000",
    ])


if __name__ == "__main__":
    main()