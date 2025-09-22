+++
title = "Arquitetura do Sistema 🏗️"
date = "2025-09-22T13:22:00-03:00"
weight = 60
toc = true
+++

Bem-vindo à documentação da arquitetura do projeto **Integralizei UNB**.

Esta seção detalha a estrutura técnica, as tecnologias escolhidas e as decisões de design que formam a espinha dorsal da nossa aplicação. O objetivo é fornecer uma visão clara de como os componentes do sistema se conectam e operam.

---

### Pilares da Nossa Arquitetura

A construção do nosso sistema foi guiada por quatro princípios fundamentais para garantir um produto robusto, seguro e eficiente.

1.  **Modularidade:** Cada componente do backend (coleta, extração, armazenamento e análise) foi projetado para operar de forma independente. Isso facilita a manutenção, o teste e futuras atualizações sem impactar o resto do sistema.

2.  **Escalabilidade:** A arquitetura foi pensada para suportar um número crescente de usuários e um volume cada vez maior de dados de históricos, garantindo que a performance não seja degradada com o tempo.

3.  **Segurança e Privacidade:** A proteção dos dados do usuário é nossa maior prioridade. Implementamos uma política de descarte imediato de dados sensíveis e utilizamos as melhores práticas para o armazenamento seguro das informações relevantes.

4.  **Acurácia:** A escolha de usar um agente de IA para a extração de dados foi uma decisão estratégica para garantir a máxima precisão na leitura dos diferentes formatos de históricos, que é o núcleo da nossa funcionalidade.

### Diagrama da Arquitetura

A imagem abaixo ilustra o fluxo de dados e a interação entre os principais componentes do nosso sistema.

![Diagrama da Arquitetura do Integralizei UNB](/images/diagrama-arquitetura.png)

