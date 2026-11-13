import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = tempfile.mkdtemp()
TEST_DB = Path(TMP_DIR) / "quiz_stats.db"

# Estado histórico real de produção: 93 participantes = 63 + 14 + 16.
HISTORICO = (1, 93, 63, 14, 16, 43)


def criar_banco_legado():
    if TEST_DB.exists():
        TEST_DB.unlink()
    conn = sqlite3.connect(TEST_DB)
    conn.execute(
        """
        CREATE TABLE estatisticas (
            id INTEGER PRIMARY KEY,
            total_participantes INTEGER DEFAULT 0,
            total_passivo INTEGER DEFAULT 0,
            total_transicao INTEGER DEFAULT 0,
            total_ativo INTEGER DEFAULT 0,
            total_visitas INTEGER DEFAULT 0
        )
        """
    )
    conn.execute("INSERT INTO estatisticas VALUES (?, ?, ?, ?, ?, ?)", HISTORICO)
    conn.commit()
    conn.close()


# Deve ocorrer antes do import: o backend executa a migração no carregamento do módulo.
os.environ["QUIZ_DB_PATH"] = str(TEST_DB)
criar_banco_legado()
sys.path.insert(0, str(SITE_DIR))
import backend  # noqa: E402


def consultar(sql, params=()):
    conn = sqlite3.connect(TEST_DB)
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


class BackendFaixaEtariaTest(unittest.TestCase):
    def setUp(self):
        criar_banco_legado()
        backend.ensure_schema()
        backend.ensure_faixa_schema()
        self.client = backend.app.test_client()

    def test_migracao_preserva_historico_como_nao_informada(self):
        linhas = {
            (faixa, perfil): total
            for faixa, perfil, total in consultar(
                "SELECT faixa_etaria, perfil, total FROM estatisticas_faixa"
            )
        }
        self.assertEqual(linhas[("nao_informada", "passivo")], 63)
        self.assertEqual(linhas[("nao_informada", "transicao")], 14)
        self.assertEqual(linhas[("nao_informada", "ativo")], 16)
        self.assertEqual(consultar("SELECT * FROM estatisticas WHERE id = 1"), [HISTORICO])

    def test_migracao_e_idempotente(self):
        backend.ensure_faixa_schema()
        backend.ensure_faixa_schema()
        self.assertEqual(
            consultar("SELECT COUNT(*) FROM estatisticas_faixa WHERE faixa_etaria = 'nao_informada'"),
            [(3,)],
        )
        self.assertEqual(
            consultar("SELECT total FROM estatisticas_faixa WHERE faixa_etaria = 'nao_informada' AND perfil = 'passivo'"),
            [(63,)],
        )

    def test_update_rejeita_faixa_ausente_ou_invalida_sem_alterar_contadores(self):
        casos = [
            {"profile": "ativo"},
            {"profile": "ativo", "faixa_etaria": "Sem idade"},
            {"profile": "ativo", "faixa_etaria": "nao_informada"},
            {"profile": "ativo", "faixa_etaria": None},
        ]
        for payload in casos:
            with self.subTest(payload=payload):
                resposta = self.client.post("/update", json=payload)
                self.assertEqual(resposta.status_code, 400)
        self.assertEqual(consultar("SELECT * FROM estatisticas WHERE id = 1"), [HISTORICO])

    def test_update_rejeita_perfil_invalido(self):
        resposta = self.client.post("/update", json={"profile": "x", "faixa_etaria": "20_25"})
        self.assertEqual(resposta.status_code, 400)

    def test_update_incrementa_totais_e_cruzamento_por_faixa(self):
        self.assertEqual(self.client.post("/update", json={"profile": "ativo", "faixa_etaria": "20_25"}).status_code, 200)
        self.assertEqual(self.client.post("/update", json={"profile": "ativo", "faixa_etaria": "20_25"}).status_code, 200)
        self.assertEqual(self.client.post("/update", json={"profile": "passivo", "faixa_etaria": "ate_19"}).status_code, 200)

        totais = consultar(
            "SELECT total_participantes, total_passivo, total_transicao, total_ativo FROM estatisticas WHERE id = 1"
        )
        self.assertEqual(totais, [(96, 64, 14, 18)])
        self.assertEqual(
            consultar("SELECT total FROM estatisticas_faixa WHERE faixa_etaria = '20_25' AND perfil = 'ativo'"),
            [(2,)],
        )
        self.assertEqual(
            consultar("SELECT total FROM estatisticas_faixa WHERE faixa_etaria = 'nao_informada' AND perfil = 'ativo'"),
            [(16,)],
        )

    def test_stats_mantem_chaves_existentes_e_soma_bate_com_totais(self):
        self.client.post("/update", json={"profile": "transicao", "faixa_etaria": "40_mais"})
        dados = self.client.get("/stats").get_json()

        for chave in ("total_participantes", "total_passivo", "total_transicao", "total_ativo", "total_visitas"):
            self.assertIn(chave, dados)

        por_faixa = dados["por_faixa_etaria"]
        self.assertEqual(set(por_faixa), {"ate_19", "20_25", "26_39", "40_mais", "nao_informada"})
        for faixa in por_faixa.values():
            self.assertEqual(set(faixa), {"passivo", "transicao", "ativo"})
        self.assertEqual(por_faixa["40_mais"]["transicao"], 1)
        for perfil in ("passivo", "transicao", "ativo"):
            soma = sum(faixa[perfil] for faixa in por_faixa.values())
            self.assertEqual(soma, dados[f"total_{perfil}"])


if __name__ == "__main__":
    unittest.main()
