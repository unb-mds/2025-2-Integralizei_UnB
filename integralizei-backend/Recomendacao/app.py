import requests
from flask import Flask, render_template
import random
import sqlite3
import os

app = Flask(__name__)
DB_NAME = "integralizei.db" 
BASE_URL = "https://api.suagradeunb.com.br/"

OPTATIVAS_SOFTWARE = [
    "CIC0191", "ENM0080", "FCTE0001", "FCTE0002", "FCTE0003", "FCTE0004",
    "FCTE0005", "FCTE0006", "FCTE0007", "FEF0105", "FGA0006", "FGA0008",
    "FGA0027", "FGA0028", "FGA0031", "FGA0034", "FGA0038", "FGA0041",
    "FGA0043", "FGA0045", "FGA0046", "FGA0053", "FGA0054", "FGA0066",
    "FGA0072", "FGA0074", "FGA0083", "FGA0084", "FGA0090", "FGA0111",
    "FGA0112", "FGA0125", "FGA0129", "FGA0134", "FGA0144", "FGA0148",
    "FGA0154", "FGA0155", "FGA0166", "FGA0167", "FGA0169", "FGA0171",
    "FGA0174", "FGA0179", "FGA0181", "FGA0186", "FGA0188", "FGA0201",
    "FGA0203", "FGA0204", "FGA0220", "FGA0221", "FGA0226", "FGA0254",
    "FGA0264", "FGA0265", "FGA0274", "FGA0275", "FGA0279", "FGA0319",
    "FGA0320", "FGA0321", "FGA0322", "FGA0323", "FGA0324", "FGA0325",
    "FGA0326", "FGA0327", "FGA0328", "FTD0007", "LIP0174", "MAT0027"
]

OPTATIVAS_ENGENHARIAS_FCTE = [
    "ADM0023", "ADM0092", "CIC0007", "CIC0088", "CIC0090", "CIC0093", "CIC0105",
    "CIC0140", "CIC0174", "CIC0175", "CIC0197", "ECL0030", "ENC0035", "ENC0132",
    "ENE0334", "ENM0080", "ENM0120", "EPR0072", "EST0019", "FGA0001", "FGA0003",
    "FGA0004", "FGA0006", "FGA0007", "FGA0026", "FGA0027", "FGA0028", "FGA0030",
    "FGA0031", "FGA0033", "FGA0034", "FGA0035", "FGA0036", "FGA0038", "FGA0041",
    "FGA0042", "FGA0043", "FGA0044", "FGA0045", "FGA0046", "FGA0047", "FGA0053",
    "FGA0054", "FGA0067", "FGA0069", "FGA0071", "FGA0073", "FGA0075", "FGA0078",
    "FGA0085", "FGA0086", "FGA0087", "FGA0093", "FGA0102", "FGA0104", "FGA0123",
    "FGA0125", "FGA0126", "FGA0127", "FGA0128", "FGA0134", "FGA0137", "FGA0138",
    "FGA0139", "FGA0141", "FGA0142", "FGA0146", "FGA0147", "FGA0152", "FGA0155",
    "FGA0156", "FGA0158", "FGA0159", "FGA0165", "FGA0171", "FGA0172", "FGA0175",
    "FGA0179", "FGA0187", "FGA0197", "FGA0204", "FGA0206", "FGA0208", "FGA0238",
    "FGA0242", "FGA0248", "FGA0262", "IFD0175", "IFD0177", "IFD0179", "IFD0181",
    "IFD0210", "IFD0217", "IFD0353", "IGD0021", "IGD0049", "IGD0051", "IGD0138",
    "IGD0140", "IGD0143", "IGD0182", "IGD0183", "IGD0185", "IGD0187", "IGD0192",
    "IGD0193", "IGD0198", "IGD0201", "IGD0202", "IGD0203", "IGD0210", "IGD0213",
    "IGD0214", "IGD0223", "IGD0244", "IGD0251", "IGD0252", "IQD0051", "LIP0174",
    "MAT0010", "MAT0039", "MAT0048", "MAT0059", "CIC0004", "FGA0084", "FGA0166",
    "FGA0167", "FGA0169", "FGA0254", "FGA0090", "FGA0133", "IQD0125", "IQD0126"
]

OPTATIVAS_ELETRONICA = [
    "FGA0003", "FGA0013", "FGA0014", "FGA0015", "FGA0016", "FGA0025", "FGA0028",
    "FGA0044", "FGA0046", "FGA0053", "FGA0057", "FGA0088", "FGA0089", "FGA0094",
    "FGA0095", "FGA0097", "FGA0116", "FGA0129", "FGA0138", "FGA0147", "FGA0158",
    "FGA0165", "FGA0166", "FGA0167", "FGA0169", "FGA0170", "FGA0171", "FGA0181",
    "FGA0195", "FGA0198", "FGA0200", "FGA0201", "FGA0202", "FGA0211", "FGA0221",
    "FGA0222", "FGA0224", "FGA0226", "FGA0254", "FGA0256", "FGA0257", "FGA0258",
    "FGA0259", "FGA0260", "FGA0261", "FGA0262", "FGA0280", "FGA0292", "FGA0323",
    "FGA0324", "FGA0325", "FGA0326", "FGA0327", "FGA0328", "FGA0380", "FTD0007",
    "IFD0177", "IFD0179", "IFD0181", "LIP0174"
]

OPTATIVAS_ENERGIA = [
    "ENM0070", "FGA0006", "FGA0008", "FGA0030", "FGA0031", "FGA0033", "FGA0034",
    "FGA0035", "FGA0036", "FGA0037", "FGA0038", "FGA0041", "FGA0042", "FGA0043",
    "FGA0044", "FGA0045", "FGA0046", "FGA0055", "FGA0057", "FGA0066", "FGA0068",
    "FGA0070", "FGA0071", "FGA0072", "FGA0073", "FGA0074", "FGA0076", "FGA0090",
    "FGA0093", "FGA0100", "FGA0101", "FGA0107", "FGA0122", "FGA0125", "FGA0127",
    "FGA0130", "FGA0134", "FGA0137", "FGA0138", "FGA0146", "FGA0152", "FGA0155",
    "FGA0158", "FGA0159", "FGA0166", "FGA0167", "FGA0171", "FGA0172", "FGA0173",
    "FGA0181", "FGA0188", "FGA0194", "FGA0199", "FGA0200", "FGA0214", "FGA0218",
    "FGA0219", "FGA0226", "FGA0232", "FGA0235", "FGA0238", "FGA0247", "FGA0248",
    "FGA0251", "FGA0254", "FGA0261", "FGA0306", "FGA0323", "FGA0324", "FGA0325",
    "FGA0326", "FGA0327", "FGA0328", "FGA0330", "FGA0332", "FGA0333", "FGA0334",
    "FGA0335", "FGA0336", "FGA0379", "FTD0007", "IFD0179", "LIP0174"
]

OPTATIVAS_AUTOMOTIVA = [
    "CIC0007", "CIC0088", "DEG0200", "DEG0201", "DEG0202", "DEG0203", "DEG0205",
    "DEG0206", "DEG0207", "DEG0208", "DEG0209", "DEG0210", "DEG0211", "DEG0212",
    "DEG0213", "DEG0214", "DEG0215", "DEG0216", "DEG0217", "DEG0218", "DEG0219",
    "FGA0007", "FGA0040", "FGA0046", "FGA0077", "FGA0123", "FGA0125", "FGA0126",
    "FGA0127", "FGA0128", "FGA0131", "FGA0167", "FGA0186", "FGA0195", "FGA0214",
    "FGA0232", "FGA0233", "FGA0268", "FGA0270", "FGA0271", "FGA0272", "FGA0284",
    "FGA0285", "FGA0379", "LIP0174"
]

OPTATIVAS_AEROESPACIAL = [
    "CIC0007", "CIC0088", "DEG0200", "DEG0201", "DEG0202", "DEG0203", "DEG0205",
    "DEG0206", "DEG0207", "DEG0208", "DEG0209", "DEG0210", "DEG0211", "DEG0212",
    "DEG0213", "DEG0214", "DEG0215", "DEG0216", "DEG0217", "DEG0218", "DEG0219",
    "ENE0277", "FGA0003", "FGA0004", "FGA0007", "FGA0023", "FGA0026", "FGA0027",
    "FGA0028", "FGA0030", "FGA0031", "FGA0033", "FGA0034", "FGA0036", "FGA0037",
    "FGA0041", "FGA0042", "FGA0044", "FGA0046", "FGA0047", "FGA0049", "FGA0052",
    "FGA0053", "FGA0054", "FGA0055", "FGA0056", "FGA0062", "FGA0063", "FGA0064",
    "FGA0065", "FGA0066", "FGA0080", "FGA0082", "FGA0090", "FGA0104", "FGA0105",
    "FGA0106", "FGA0121", "FGA0123", "FGA0125", "FGA0126", "FGA0127", "FGA0128",
    "FGA0134", "FGA0137", "FGA0138", "FGA0141", "FGA0142", "FGA0143", "FGA0144",
    "FGA0146", "FGA0152", "FGA0155", "FGA0156", "FGA0158", "FGA0159", "FGA0165",
    "FGA0166", "FGA0167", "FGA0169", "FGA0172", "FGA0175", "FGA0187", "FGA0188",
    "FGA0191", "FGA0196", "FGA0199", "FGA0229", "FGA0248", "FGA0249", "FGA0281",
    "FGA0282", "FGA0283", "FGA0286", "FGA0289", "FGA0291", "FGA0293", "FTD0007",
    "LIP0174"
]


def obter_periodo_atual():
    """
    Busca o ano e período letivo atual/futuro na API.
    Retorna (ano, periodo) ou um fallback em caso de falha.
    """
    try:
        url = f"{BASE_URL}courses/year-period/"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and data.get("year/period"):
                periodo_str = data["year/period"][0]
                ano, periodo = periodo_str.split('/')
                return ano, periodo
    except requests.RequestException as e:
        print(f"Erro ao buscar período: {e}")
        
    return "2025", "2" 

def buscar_disciplina_api(codigo, ano, periodo):
    """
    Busca uma única disciplina na API da SuaGradeUnB pelo código.
    Retorna um dicionário com nome e código, ou None se falhar.
    """
    url = f"{BASE_URL}courses/"
    params = {
        "search": codigo,
        "year": ano,
        "period": periodo
    }
    
    try:
        response = requests.get(url, params=params, timeout=10) 
        
        if response.status_code == 200:
            data = response.json()
            if data and isinstance(data, list) and len(data) > 0:
                primeira_materia = data[0]
                return {
                    "codigo": primeira_materia.get('code', codigo),
                    "nome": primeira_materia.get('name', 'Nome não encontrado')
                }
    except requests.RequestException as e:
        print(f"Erro ao buscar disciplina {codigo}: {e}")

    return None

def get_aluno_data():
    """
    Busca os dados do primeiro aluno no banco de dados.
    Retorna (curso, conjunto_de_materias_cursadas)
    Retorna (None, set()) se o DB ou o aluno não forem encontrados.
    """
    if not os.path.exists(DB_NAME):
        print(f"Aviso: Arquivo '{DB_NAME}' não encontrado. Usando modo padrão.")
        return None, set()

    conn = None
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        # !!! NOTA PARA O FUTURO: Aqui pegamos o primeiro aluno.
        # !!! Isso deve ser trocado pela lógica de "aluno logado".
        cursor.execute("SELECT id, curso FROM alunos ORDER BY id LIMIT 1")
        aluno = cursor.fetchone()
        
        if aluno:
            aluno_id, curso_nome = aluno[0], aluno[1]
            
            cursor.execute("SELECT codigo FROM disciplinas_cursadas WHERE aluno_id = ?", (aluno_id,))
            
            materias_cursadas_tuplas = cursor.fetchall()
            
            # Converte a lista de tuplas [('CIC0004',), ('MAT0026',)] 
            # em um conjunto (set) {'CIC0004', 'MAT0026'} para performance.
            materias_cursadas_set = {tupla[0] for tupla in materias_cursadas_tuplas}
            
            return curso_nome, materias_cursadas_set
        
        else:
            # DB existe, mas está vazio (sem alunos)
            print("Aviso: DB encontrado, mas sem alunos. Usando modo padrão.")
            return None, set()

    except sqlite3.Error as e:
        print(f"Erro ao ler o banco de dados: {e}")
        return None, set()
    finally:
        if conn:
            conn.close()

def selecionar_lista_optativas(curso_nome):
    """
    Seleciona a lista de optativas correta com base no nome do curso.
    Retorna (lista_de_optativas, nome_do_curso_para_debug)
    """
    if not curso_nome:
        # Fallback se não houver aluno no DB
        return OPTATIVAS_SOFTWARE, "SOFTWARE (Padrão - Sem Aluno)"

    curso_upper = curso_nome.upper() # Converte para maiúsculas para evitar erros
    
    if "SOFTWARE" in curso_upper:
        return OPTATIVAS_SOFTWARE, "SOFTWARE"
    elif "AEROESPACIAL" in curso_upper:
        return OPTATIVAS_AEROESPACIAL, "AEROESPACIAL"
    elif "AUTOMOTIVA" in curso_upper:
        return OPTATIVAS_AUTOMOTIVA, "AUTOMOTIVA"
    elif "ELETRONICA" in curso_upper:
        return OPTATIVAS_ELETRONICA, "ELETRONICA"
    elif "ENERGIA" in curso_upper:
        return OPTATIVAS_ENERGIA, "ENERGIA"
    else:
        # Fallback padrão se não reconhecer o curso
        nome_debug = f"SOFTWARE (Padrão - Curso '{curso_nome}' não reconhecido)"
        return OPTATIVAS_SOFTWARE, nome_debug

# --- Rota Principal (View) ---

@app.route('/')
def home():
    """
    Rota principal que renderiza a página de recomendações.
    """
    
    # 1. Busca dados do aluno no DB
    curso_aluno, materias_cursadas = get_aluno_data()
    
    # 2. Seleciona a lista de optativas correta
    # (Se curso_aluno for None, a função de fallback usa SOFTWARE)
    lista_optativas_curso, nome_curso_debug = selecionar_lista_optativas(curso_aluno)


    # 3. Filtra as matérias que o aluno AINDA NÃO cursou
    # Converte a lista de optativas em um conjunto (set)
    optativas_set = set(lista_optativas_curso)
    
    # Faz a diferença: Optativas TOTAIS - Optativas JÁ CURSADAS
    # O resultado são apenas as matérias que o aluno pode cursar
    optativas_validas = list(optativas_set - materias_cursadas)
    
    # Embaralha a lista de matérias válidas para recomendar aleatoriamente
    random.shuffle(optativas_validas)
    
    # 4. Busca o ano e período atuais na API
    ano, periodo = obter_periodo_atual()
    
    recomendacoes = []
    
    # 5. Lógica de busca (Opção B, com limite de segurança)
    MAX_TENTATIVAS = 20
    tentativas = 0
    
    # Continua enquanto não tiver 3 recomendações E
    # ainda tiver códigos válidos para tentar E
    # não tiver atingido o limite de tentativas
    while len(recomendacoes) < 3 and optativas_validas and tentativas < MAX_TENTATIVAS:
        
        # Pega o próximo código aleatório da lista JÁ FILTRADA
        codigo = optativas_validas.pop()
        
        # Tenta buscar na API (verifica se está ofertada NO SEMESTRE)
        materia_info = buscar_disciplina_api(codigo, ano, periodo)
        
        if materia_info:
            # Encontrou! Adiciona na lista.
            recomendacoes.append(materia_info)
        
        tentativas += 1

    # 6. Envia os dados (o que encontrou) para o template HTML
    return render_template('index.html', recomendacoes=recomendacoes)

# --- Execução do Aplicativo ---

if __name__ == "__main__":
    # Garante que o arquivo DB esteja na mesma pasta que o app.py
    app.run(debug=True)