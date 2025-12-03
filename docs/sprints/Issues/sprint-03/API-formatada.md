

Este código realiza a busca de disciplinas na API da UnB e formata a saída de forma organizada, exibindo:  
- **Nome e código da disciplina**  
- **Departamento responsável**  
- **Turmas disponíveis** com informações de:  
  - Professores  
  - Sala  
  - Horários  
---

## Código

```python
import requests

BASE_URL = "https://api.suagradeunb.com.br/"

def buscar_disciplina(codigo, ano=None, periodo=None):
    url = f"{BASE_URL}courses/"
    params = {"search": codigo}
    if ano:
        params["year"] = ano
    if periodo:
        params["period"] = periodo

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        if data:
            return data
        else:
            print("Nenhuma disciplina encontrada.")
    else:
        print(f"Erro {response.status_code}: {response.text}")
    return None


if __name__ == "__main__":
    codigo = input("Digite o código da disciplina (ex: MAT0027): ").strip().upper()
    ano = input("Digite o ano : ").strip()
    periodo = input("Digite o período : ").strip()

    ano = int(ano) if ano else None
    periodo = int(periodo) if periodo else None

    resultado = buscar_disciplina(codigo, ano, periodo)

    if resultado:
        for d in resultado:
            print(f"\nDisciplina: {d.get('name', 'N/A')} ({d.get('code', 'N/A')})")
            print(f"Departamento: {d.get('department', {}).get('code', 'N/A')}")
            print("=" * 60)

            for turma in d.get('classes', []):
                turma_num = turma.get('_class', 'N/A')
                professores = ", ".join(turma.get('teachers', ['N/A']))
                horarios = ", ".join(turma.get('days', ['N/A']))
                sala = turma.get('classroom', 'N/A')

                print(f"Turma: {turma_num}")
                print(f"Professores: {professores}")
                print(f"Sala: {sala}")
                print(f"Horários: {horarios}")
                print("-" * 50)
            print("\n" )

## Saída

Digite o código da disciplina (ex: MAT0027): FGA0312
Digite o ano : 2025
Digite o período : 2

Disciplina: MÉTODOS DE DESENVOLVIMENTO DE SOFTWARE (FGA0312)
Departamento: 673
============================================================
Turma: 02
Professores: CARLA SILVA ROCHA AGUIAR
Sala: FCTE - MOCAP
Horários: Quarta-feira 10:00 às 11:50, Sexta-feira 10:00 às 11:50
--------------------------------------------------
Turma: 03
Professores: LUCAS URSULINO BOAVENTURA, RICARDO AJAX DIAS KOSLOSKI
Sala: FCTE - I9
Horários: Sábado 08:00 às 11:50
--------------------------------------------------
