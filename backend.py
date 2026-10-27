import sqlite3
from pathlib import Path
from flask import Flask, request, jsonify, send_file

app = Flask(__name__, static_folder=Path(__file__).parent, static_url_path="")

DB_PATH = Path(__file__).parent / "db" / "quiz_stats.db"
MEDIA_PATH = Path(__file__).parent.parent / "media"

# Whitelist de perfis válidos para validação no endpoint /update
PERFIS_VALIDOS = ("passivo", "transicao", "ativo")


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_schema():
    conn = get_db()
    try:
        conn.execute("ALTER TABLE estatisticas ADD COLUMN total_visitas INTEGER DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        pass  # column already exists
    finally:
        conn.close()


ensure_schema()


@app.route("/")
def index():
    return app.send_static_file("html/index.html")


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


@app.before_request
def track_visit():
    path = request.path
    if path == "/":
        conn = get_db()
        try:
            conn.execute(
                "UPDATE estatisticas SET total_visitas = total_visitas + 1 WHERE id = 1"
            )
            conn.commit()
        except Exception:
            pass
        finally:
            conn.close()


@app.route("/update", methods=["POST"])
def update():
    data = request.get_json()
    if not data or "profile" not in data:
        return jsonify({"error": "Missing profile"}), 400
    profile = data["profile"]
    if profile not in PERFIS_VALIDOS:
        return jsonify({"error": "Invalid profile"}), 400
    conn = get_db()
    try:
        conn.execute(
            """
            UPDATE estatisticas
            SET total_participantes = total_participantes + 1,
                total_passivo = total_passivo + CASE WHEN ? = 'passivo' THEN 1 ELSE 0 END,
                total_transicao = total_transicao + CASE WHEN ? = 'transicao' THEN 1 ELSE 0 END,
                total_ativo = total_ativo + CASE WHEN ? = 'ativo' THEN 1 ELSE 0 END
            WHERE id = 1
        """,
            (profile, profile, profile),
        )
        conn.commit()
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/stats", methods=["GET"])
def stats():
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM estatisticas WHERE id = 1").fetchone()
        if row is None:
            return jsonify({"error": "No data"}), 404
        return (
            jsonify(
                {
                    "total_participantes": row["total_participantes"],
                    "total_passivo": row["total_passivo"],
                    "total_transicao": row["total_transicao"],
                    "total_ativo": row["total_ativo"],
                    "total_visitas": row["total_visitas"],
                }
            ),
            200,
        )
    finally:
        conn.close()


@app.route("/stream/audio/<path:filename>")
def stream_audio(filename):
    """Serve audio files via streaming to prevent direct downloads."""
    file_path = MEDIA_PATH / "audio" / filename
    if not file_path.exists() or not file_path.is_file():
        return jsonify({"error": "Audio not found"}), 404
    # Use conditional=True for range request support (seeking)
    return send_file(
        file_path,
        mimetype="audio/mp4",
        conditional=True,
        as_attachment=False,
        download_name=filename,
    )


@app.route("/stream/video/<path:filename>")
def stream_video(filename):
    """Serve video files via streaming to prevent direct downloads."""
    file_path = MEDIA_PATH / "video" / filename
    if not file_path.exists() or not file_path.is_file():
        return jsonify({"error": "Video not found"}), 404
    # Use conditional=True for range request support (seeking)
    return send_file(
        file_path,
        mimetype="video/mp4",
        conditional=True,
        as_attachment=False,
        download_name=filename,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
