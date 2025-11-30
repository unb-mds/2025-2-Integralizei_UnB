import re
import sys
from typing import Dict, List, Optional, Tuple

# ============== Tentativa de import do extrator do seu projeto ==============
try:
    from .text_extract import extract_any  # type: ignore
except Exception:
    try:
        import pdfplumber  # type: ignore
    except Exception:
        pdfplumber = None

    def extract_any(pdf_path: str) -> str:
        if pdfplumber is None:
            raise RuntimeError(
                "Nem .text_extract.extract_any nem pdfplumber disponíveis. "
                "Instale pdfplumber (pip install pdfplumber) ou forneça .text_extract.extract_any."
            )
        parts = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                txt = page.extract_text() or ""
                parts.append(txt)
        return "\n".join(parts)


# ========================== Configurações e Constantes ==========================
# Menções/situações que contam como "aprovado" (entram na integralização)
# (Separa menções de status para permitir contar CUMP)
APR_MENTION_CODES = {"SS", "MS", "MM", "APROVADO", "EQV"}
APR_STATUS_CODES = {"APR", "CUMP", "EQV"}  # <- inclui CUMP

# Fallback por curso (se o PDF não trouxer o total "Exigido")
COURSE_DEFAULTS = {
    "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO": 3480,
}
DEFAULT_TOTAL_EXIGIDO = (
    3480  # usado se não achar no PDF e não houver match no COURSE_DEFAULTS
)

# Para cortar "sobras" depois de capturar um campo
CUT_AFTER = r"(?i)\bMatr[ií]cula\b|CPF\b|Curso\b|IRA\b|MP\b|Per[ií]odo\b"


# ================================ Helpers gerais ================================
def _norm(s: str) -> str:
    return re.sub(r"[ \t]+", " ", s or "").strip()


def _cut(s: str) -> str:
    return re.split(CUT_AFTER, s)[0].strip(" -–—:;|")


def _to_int(x: Optional[str]) -> Optional[int]:
    if not x:
        return None
    try:
        return int(x)
    except Exception:
        return None


def _to_float(x: Optional[str]) -> Optional[float]:
    if not x:
        return None
    try:
        return float(x.replace(",", "."))
    except Exception:
        return None


def _normalize_breaks(s: str) -> str:
    # remove hífen no fim de linha: "ALGORIT-\nMOS" -> "ALGORITMOS"
    s = re.sub(r"-\s*\n\s*", "", s)
    # normaliza \xa0 e espaços múltiplos
    s = s.replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    # consolida quebras
    s = re.sub(r"\s*\n\s*", "\n", s)
    return s.strip()


def _clean_name(nome: Optional[str]) -> Optional[str]:
    if nome is None:
        return None
    nome = re.sub(r"\s{2,}", " ", nome).strip(" -–—:;|")
    return nome or None


# ================================ Regex reutilizáveis ================================
# Código mais permissivo (FGA0161, CIC0004, LET0331, FGA0146A etc.)
CODE_RX = r"(?P<codigo>(?:[A-Z]{2,4}[A-Z]?\d{3,4}[A-Z0-9]?))"
# Período (inline na mesma linha do nome)
# aceita tanto "2024.1 NOME..." quanto "2024.1NOME..."
TERM_INLINE_RX = re.compile(r"^(?P<periodo>\d{4}[./-][12])\s*(?P<nome>.+)$")

# Linha 3 (colunas):  Turma 09  APRFGA0161  60  96,0  MS*
LINE3_RX = re.compile(
    r"""^\s*
        (?P<turma>(--|\d{2}))\s+
        # status colado no código: APRFGA0161 → status=APR, codigo=FGA0161
        (?P<status>APR|MATR|CUMP|REP|TR|SR|II|-)\s*
        (?P<codigo>[A-Z]{2,4}[A-Z]?\d{3,4}[A-Z0-9]*)\s+
        (?P<ch>\d{1,3})\s+                    # CH (60, 90...)
        (?P<freq>\d{1,3},\d|--)\s+            # 96,0  ou --
        (?P<mencao>[A-Z\-]{1,3})(?P<sufixo>[\*\#e-])?\s*$   # MS, SS, MM, - (com * # e)
    """,
    re.X,
)

# Linha 2 (professor): "... (90h)"  → captura CH caso a linha 3 não traga
PROF_CH_RX = re.compile(r"\((?P<ch>\d{1,3})h\)")

# Nome do professor na linha 2: "Dr. / Dra. / MSc. FULANO ... (90h) ..."
PROF_NOME_RX = re.compile(
    r"(?P<professor>(?:Dr|Dra|MSc)\.?\s+[A-ZÁ-Ú][^()]+?)\s*\(\s*\d{1,3}\s*h\s*\)",
    re.I,
)

PROF_LINHA_COMPLETA_RX = re.compile(
    r"""^(?P<titulacao>Dr|Dra|MSc)\.?\s+
        (?P<professor>.+?)\s*
        \((?P<ch>\d{1,3})h\)   
        \s*
        (?P<turma>(\d{2}|--))\s+
        (?P<status>APR|MATR|CUMP|REP|TR|II|SR|-)\s+
        (?P<codigo>[A-Z]{2,4}[A-Z]?\d{3,4}[A-Z0-9]?)\s+
        (?P<ch2>\d{1,3})\s+
        (?P<nota>\d{1,3},\d)\s+
        (?P<mencao>[A-Z\-]{1,3})
        """,
    re.X,
)

# Créditos/carga-horária em formatos variados (se necessário em fallbacks)
CRED_TOKEN_RX = re.compile(
    r"(?:(?P<cr1>\b\d{1,2})\s*cr\b)|"  # "4 cr"
    r"(?:(?:\bcr\b[: ]*)(?P<cr2>\d{1,2}))|"  # "cr: 4" / "cr 4"
    r"(?:(?:cr[eé]ditos?\b[: ]*)(?P<cr3>\d{1,2}))|"  # "créditos: 4"
    r"(?:(?:\bCH\b[: ]*)(?P<ch1>\d{2,3}))|"  # "CH 60"
    r"(?:(?P<ch2>\d{2,3})\s*h\b)",  # "60h"
    re.I,
)

# ======== Suporte ao layout "linha direta" do SIGAA ========
# Linha direta: "2024.1 * FGA0161 60 02 96,0 MS APR"
DIRECT_RX = re.compile(
    r"^(?P<periodo>\d{4}[./-][12])\s*[#\*]?\s*(?P<codigo>[A-Z]{2,4}[A-Z]?\d{3,4}[A-Z0-9]?)\s+(?P<resto>.+)$"
)

# Linha de professor/cabeçalho (evitar confundir com nome)
PROF_LINE_RX = re.compile(
    r"(?P<professor>(?:Dr|Dra|MSc)\.?\s+[A-ZÁ-Ú][^()]+?)\s*\(\s*\d{1,3}\s*h\s*\)",
    re.I,
)


# Padrões de menção e status dentro da linha direta
STATUS_RX = re.compile(r"\b(APR|MATR|CUMP|REP|TR|II|SR|-)\b", re.I)
MENCAO_RX = re.compile(r"\b(SS|MS|MM|MI|II|SR|TR|--)\*?\b", re.I)

# Blacklists (administrativo/ENADE/NADE)
ADMIN_CODE_BLACKLIST = re.compile(r"^(CEP|SAA|NADE)\b", re.I)
ADMIN_NAME_BLACKLIST = re.compile(
    r"(ENADE|NADE|Secretaria|Letivo|Atividade|Dispensa|Aproveitamento|Certificado|"
    r"Est[aá]gio|Complementar|Extens[aã]o|Monitoria|Semin[aá]ri|Workshop|Palestra|Oficina|"
    r"Dr\.|Profa?\.|Prof\.|Professor|DEG - Decanato|SIGLA SIGNIFICADO|Componentes Curriculares|Legenda)",
    re.I,
)
EXCLUDE_ENADE_RX = re.compile(r"\bE?NADE\b", re.I)


def _looks_admin(code: Optional[str], nome: Optional[str]) -> bool:
    c = code or ""
    n = nome or ""
    return (c and (ADMIN_CODE_BLACKLIST.search(c) or EXCLUDE_ENADE_RX.search(c))) or (
        n and (ADMIN_NAME_BLACKLIST.search(n) or EXCLUDE_ENADE_RX.search(n))
    )


# ================================ Campos básicos ================================
def pegar_nome(texto: str) -> Optional[str]:
    for rx in [
        re.compile(r"(?im)^\s*Nome\s*:\s*(.+)$"),
        re.compile(r"(?im)^\s*Aluno\(a\)\s*:\s*(.+)$"),
        re.compile(r"(?im)^\s*Discente\s*:\s*(.+)$"),
    ]:
        m = rx.search(texto)
        if m:
            return _cut(m.group(1))
    return None


def pegar_matricula(texto: str) -> Optional[str]:
    m = re.search(r"(?i)\bMatr[ií]cula\s*:\s*([0-9.\-]+)", texto)
    return m.group(1).replace(".", "").replace("-", "").strip() if m else None


def pegar_curso(texto: str) -> Optional[str]:
    m = re.search(r"(?im)^\s*Curso\s*:\s*(.+)$", texto)
    return _cut(m.group(1)) if m else None


def pegar_ira_mp(texto: str) -> Tuple[Optional[float], Optional[float]]:
    ira = mp = None
    m = re.search(r"(?i)\bIRA\s*:\s*([0-9]+[.,][0-9]+)", texto)
    if m:
        ira = float(m.group(1).replace(",", "."))
    m = re.search(r"(?i)\bMP\s*:\s*([0-9]+[.,][0-9]+)", texto)
    if m:
        mp = float(m.group(1).replace(",", "."))
    return ira, mp


# ================================ Materias ================================
def extrair_materias(texto: str) -> List[Dict]:
    """
    Parser alinhado ao layout do SIGAA/UnB:
    - (a) 3 linhas:
        L1: "2024.1 NOME DA DISCIPLINA"
        L2: "Dr(a). ... (90h)"  [opcional; CH fallback]
        L3: "09 APRFGA0161 60 96,0 MS*"  [turma, status+codigo, CH, freq, menção]
    - (b) Linha direta: "2024.1 * FGA0161 60 02 96,0 MS APR"
    ENADE/NADE e entradas administrativas são ignorados.
    """
    materias: List[Dict] = []
    texto = _normalize_breaks(texto)
    linhas = [ln.strip() for ln in texto.splitlines() if ln.strip()]

    # Estado da disciplina corrente
    cur: Dict[str, Optional[str]] = {
        "periodo": None,
        "nome": None,
        "codigo": None,
        "status": None,  # APR/MATR/CUMP...
        "creditos": None,  # CH
        "nota": None,
        "situacao": None,  # menção SS/MS/MM/-
        "professor": None,  # NOVO
    }

    def flush():
        # salva se tiver pelo menos codigo (nome pode faltar em PDFs "apertados")
        if cur["codigo"] and not _looks_admin(cur["codigo"], cur.get("nome")):
            materias.append(
                {
                    "periodo": cur["periodo"],
                    "codigo": cur["codigo"],
                    "nome": _clean_name(cur.get("nome")),
                    "creditos": int(cur["creditos"]) if cur["creditos"] else None,
                    "situacao": (cur["situacao"] or "-"),
                    "nota": (
                        float(str(cur["nota"]).replace(",", "."))
                        if cur["nota"]
                        else None
                    ),
                    "status": cur["status"],  # mantemos no payload
                    "professor": _clean_name(cur.get("professor")),
                }
            )

    def guess_name_from_prev(idx: int) -> Optional[str]:
        """Se a linha anterior parece ser o nome (não professor/cabeçalho), retorna-a."""
        if idx - 1 >= 0:
            prev = linhas[idx - 1]
            if (
                not PROF_LINE_RX.search(prev)
                and not TERM_INLINE_RX.match(prev)
                and not DIRECT_RX.match(prev)
                and not ADMIN_NAME_BLACKLIST.search(prev)
            ):
                if not re.match(r"^\d{4}[./-][12]\b", prev):
                    return prev
        return None

    def split_resto_direct(
        resto: str,
    ) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
        """
        Do 'resto' na linha direta, tenta achar:
          - nome: trecho antes da primeira CH (número de 2–3 dígitos)
          - ch (créditos/carga-horária)
          - mencao (SS|MS|MM|...|--)
          - status (APR|MATR|CUMP|...)
        """
        # menção e status (normalmente ao final)
        mencao_match = MENCAO_RX.search(resto)
        mencao = mencao_match.group(1).upper() if mencao_match else None
        status_match = STATUS_RX.search(resto)
        status = status_match.group(1).upper() if status_match else None

        # CH = primeiro inteiro 2-3 dígitos plausível
        ch = None
        ch_match = re.search(r"\b(\d{2,3})\b", resto)
        if ch_match:
            ch = ch_match.group(1)

        # nome: trecho antes da CH (se existir)
        nome = None
        if ch:
            before = resto.split(ch, 1)[0].strip(" -–—:;|")
            # limpa tokens óbvios
            before = re.sub(
                r"\b(Turma|Freq|Frequ[eê]ncia|Menc[aã]o|Situa[cç][aã]o)\b.*$",
                "",
                before,
                flags=re.I,
            ).strip()
            if before:
                nome = before

        return nome, ch, mencao, status

    i = 0
    while i < len(linhas):
        ln = linhas[i]

        # Ignorar blocos/cabeçalhos administrativos explícitos
        if ADMIN_NAME_BLACKLIST.search(ln):
            i += 1
            continue

        # —— (b) Linha direta: "2024.1 * FGA0161 ..."
                # —— (b) Linha direta: "2024.1 * FGA0161 60 02 96,0 MS APR"
         # —— (b) Linha direta: "2024.1 * FGA0161 60 02 96,0 MS APR"
        md = DIRECT_RX.match(ln)
        if md:
            periodo = md.group("periodo")
            codigo = md.group("codigo")
            resto = md.group("resto")

            if _looks_admin(codigo, None):
                i += 1
                continue

            # Nome pela linha anterior e/ou pelo próprio 'resto'
            nome_prev = guess_name_from_prev(i)
            nome_est, ch, mencao, status = split_resto_direct(resto)
            nome_final = nome_prev or nome_est

            # 🔹 NOVO: tenta pegar professor (e CH) na linha seguinte
            prof = None
            if i + 1 < len(linhas):
                linha_prof = linhas[i + 1]

                # Se a CH não veio clara na linha direta, usa a CH do "(90h)"
                mprof_ch = PROF_CH_RX.search(linha_prof)
                if mprof_ch and not ch:
                    ch = mprof_ch.group("ch")

                mprof_nome = PROF_NOME_RX.search(linha_prof)
                if mprof_nome:
                    prof = mprof_nome.group("professor").strip()

            cur = {
                "periodo": periodo.replace(".", "/"),
                "nome": nome_final,
                "codigo": codigo,
                "status": status,
                "creditos": ch,
                "nota": None,
                "situacao": mencao,  # MENÇÃO (SS/MS/MM/…)
                "professor": prof,   # ✅ agora preenchido
            }
            flush()

            # reseta estado
            cur = {
                "periodo": None,
                "nome": None,
                "codigo": None,
                "status": None,
                "creditos": None,
                "nota": None,
                "situacao": None,
                "professor": None,
            }
            i += 1
            continue


        # —— (a) L1: "2024.1 NOME …"
        m1 = TERM_INLINE_RX.match(ln)
        if m1:
            # fecha disciplina anterior (se houver)
            if cur["nome"] or cur["codigo"]:
                flush()

            periodo = m1.group("periodo")
            nome_disc = m1.group("nome")

            # tenta pegar TUDO na linha seguinte (prof + dados)
            prof = None
            codigo = None
            status = None
            ch = None
            nota = None
            mencao = None

            if i + 1 < len(linhas):
                linha_prof = linhas[i + 1]
                mfull = PROF_LINHA_COMPLETA_RX.match(linha_prof)
                if mfull:
                    codigo = mfull.group("codigo")
                    # ignora ENADE/administrativo usando o código + nome
                    if _looks_admin(codigo, nome_disc):
                        cur = {
                            "periodo": None,
                            "nome": None,
                            "codigo": None,
                            "status": None,
                            "creditos": None,
                            "nota": None,
                            "situacao": None,
                            "professor": None,
                        }
                        i += 2
                        continue

                    titulacao = mfull.group("titulacao")
                    prof_nome = mfull.group("professor").strip()
                    prof = f"{titulacao}. {prof_nome}"

                    ch = mfull.group("ch2") or mfull.group("ch")
                    status = mfull.group("status").upper()
                    nota = mfull.group("nota")
                    mencao = (mfull.group("mencao") or "-").upper()

                    # monta e salva direto
                    cur = {
                        "periodo": periodo.replace(".", "/"),
                        "nome": nome_disc,
                        "codigo": codigo,
                        "status": status,
                        "creditos": ch,
                        "nota": nota,
                        "situacao": mencao,
                        "professor": prof,
                    }
                    flush()
                    cur = {
                        "periodo": None,
                        "nome": None,
                        "codigo": None,
                        "status": None,
                        "creditos": None,
                        "nota": None,
                        "situacao": None,
                        "professor": None,
                    }
                    i += 2  # consumiu L1 e L2
                    continue

            # se não casou o layout novo, cai fora e deixa outros blocos tentarem
            cur = {
                "periodo": periodo,
                "nome": nome_disc,
                "codigo": None,
                "status": None,
                "creditos": None,
                "nota": None,
                "situacao": None,
                "professor": None,
            }
            i += 1
            continue

        # —— L3 isolada (casos raros) — se já temos L1
        m3_only = LINE3_RX.match(ln)
        if m3_only and cur["nome"] and cur["periodo"]:
            codigo = m3_only.group("codigo")
            if not _looks_admin(codigo, cur["nome"]):
                cur["status"] = m3_only.group("status")
                cur["codigo"] = codigo
                cur["creditos"] = m3_only.group("ch") or cur["creditos"]
                mencao = re.sub(r"[^A-Z\-]", "", m3_only.group("mencao") or "-").upper()
                cur["situacao"] = mencao
                cur["nota"] = None
                flush()
            cur = {
                "periodo": None,
                "nome": None,
                "codigo": None,
                "status": None,
                "creditos": None,
                "nota": None,
                "situacao": None,
                "professor": None,
            }
            i += 1
            continue

        # —— Fallbacks leves: detectar créditos na linha 2 se houver
        if cur["nome"] and not cur["creditos"]:
            mcred = CRED_TOKEN_RX.search(ln)
            if mcred:
                md = mcred.groupdict()
                for key in ("cr1", "cr2", "cr3", "ch1", "ch2"):
                    if md.get(key):
                        try:
                            cur["creditos"] = str(int(md[key]))
                            break
                        except Exception:
                            pass

        i += 1

    # fecha o último se estiver montado
    if cur["codigo"]:
        flush()

    # de-duplicação
    uniq, seen = [], set()
    for d in materias:
        k = (d.get("periodo"), d.get("codigo"), d.get("nome"))
        if k not in seen:
            seen.add(k)
            uniq.append(d)
    return uniq


# ================================ Painel de Carga Horária ================================
def pegar_totais_painel(texto: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Busca números logo após 'Exigido' e 'Integralizado' (no bloco de Carga Horária).
    Como o texto às vezes vem "grudado", pegamos todos e ficamos com o MAIOR (normalmente o total).
    """
    exigidos = [
        _to_int(x) for x in re.findall(r"(?i)Exigido[^0-9]{0,15}(\d{2,5})\s*h", texto)
    ]
    integra = [
        _to_int(x)
        for x in re.findall(r"(?i)Integralizado[^0-9]{0,15}(\d{1,5})\s*h", texto)
    ]
    exigidos = [x for x in exigidos if x is not None]
    integra = [x for x in integra if x is not None]
    total_exigido = max(exigidos) if exigidos else None
    total_integralizado = max(integra) if integra else None
    return total_exigido, total_integralizado


def total_exigido_por_curso(curso: Optional[str]) -> Optional[int]:
    if not curso:
        return None
    for key, val in COURSE_DEFAULTS.items():
        if key.lower() == curso.lower():
            return val
    return None


# ================================ Integralização ================================
def calcular_integralizacao(
    texto: str, curso: Optional[str], materias: List[Dict]
) -> Tuple[Optional[float], Optional[int], Optional[int]]:
    """
    1) Tenta usar o painel: (ch_integralizada / ch_exigida) * 100
    2) Se faltar algo, soma CH das aprovadas e usa ch_exigida do painel, do COURSE_DEFAULTS, ou do DEFAULT_TOTAL_EXIGIDO.
    """
    ch_exigida, ch_integralizada = pegar_totais_painel(texto)

    # Se o painel já trouxe os dois, calculamos direto
    if ch_exigida and ch_integralizada is not None:
        perc = round(100.0 * ch_integralizada / ch_exigida, 2)
        return perc, ch_integralizada, ch_exigida

    # Fallback: soma CH de aprovadas
    ch_aprov = 0
    for m in materias:
        ch = m.get("creditos") or 0
        mencao = (
            m.get("situacao") or ""
        ).upper()  # aqui 'situacao' é a MENÇÃO (SS/MS/MM/…)
        status = (m.get("status") or "").upper()  # 'status' é APR/MATR/CUMP/…
        if ch and (mencao in APR_MENTION_CODES or status in APR_STATUS_CODES):
            ch_aprov += int(ch)

    # Definir ch_exigida: painel > por curso > default
    if not ch_exigida:
        ch_exigida = total_exigido_por_curso(curso) or DEFAULT_TOTAL_EXIGIDO

    perc = round(100.0 * ch_aprov / ch_exigida, 2) if ch_exigida else None
    return perc, ch_aprov, ch_exigida


# ================================ Pipeline principal ================================
def parse_basico(pdf_path: str) -> Dict:
    raw = extract_any(pdf_path)
    raw = _norm(raw)

    nome = pegar_nome(raw)
    matricula = pegar_matricula(raw)
    curso = pegar_curso(raw)
    ira, mp = pegar_ira_mp(raw)

    materias = extrair_materias(raw)
    integralizacao, ch_integralizada, ch_exigida = calcular_integralizacao(
        raw, curso, materias
    )

    return {
        "aluno": {"nome": nome, "matricula": matricula, "curso": curso},
        "indices": {"ira": ira, "mp": mp},
        "curriculo": {
            "integralizacao": integralizacao,  # número (ex.: 62.07)
            "ch_integralizada": ch_integralizada,
            "ch_exigida": ch_exigida,
            "materias": materias,
        },
        "raw_text": raw,
    }


# ================================ Execução via CLI ================================
if __name__ == "__main__":  # pragma: no cover
    if len(sys.argv) < 2:
        print("Uso: python parser_hist_unb.py caminho/para/historico.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    data = parse_basico(pdf_path)

    # Saída enxuta para validação rápida
    aluno = data["aluno"]
    indices = data["indices"]
    curr = data["curriculo"]

    print(
        f"Aluno: {aluno.get('nome') or '-'} | Matrícula: {aluno.get('matricula') or '-'}"
    )
    print(f"Curso: {aluno.get('curso') or '-'}")
    print(
        f"IRA: {indices.get('ira') if indices.get('ira') is not None else '-'} | MP: {indices.get('mp') if indices.get('mp') is not None else '-'}"
    )
    print(
        f"Integralização: {curr.get('integralizacao') if curr.get('integralizacao') is not None else '-'}% "
        f"(Integralizada={curr.get('ch_integralizada')}, Exigida={curr.get('ch_exigida')})"
    )
    print("\nDisciplinas:")
    for m in curr["materias"]:
        print(
            f" - [{m.get('periodo') or '-'}] {m['codigo']} | {m.get('nome') or '-'} | CH={m.get('creditos') or '-'} | "
            f"Menção={m.get('situacao') or '-'} | Nota={m.get('nota') if m.get('nota') is not None else '-'} | "
            f"Status={m.get('status') or '-'} | Prof={m.get('professor') or '-'}"
        )
