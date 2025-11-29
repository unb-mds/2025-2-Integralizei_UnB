---
name: Bug report
about: Create a report to help us improve
title: "[BUG]"
labels: ''
assignees: ''

---

## 🐞 Título do Bug  
Descreva de forma breve o problema encontrado.  
*Exemplo:* Erro ao salvar configurações do usuário no modal

---

## 📋 Descrição do Problema  
Explique o bug com detalhes: o que está acontecendo, qual era o comportamento esperado e onde isso ocorre. Inclua o máximo de informações relevantes.  
*Exemplo:*  
Ao tentar salvar as configurações do usuário no modal, nada acontece. O botão "Salvar" não dispara nenhuma ação visível, e os dados não são persistidos no backend.

---

## 🔁 Passos para Reproduzir  
Liste os passos para reproduzir o bug:  
1. Acesse a página de configurações do usuário  
2. Abra o modal de configurações  
3. Altere qualquer campo (ex: nome)  
4. Clique no botão "Salvar"  
5. Observe que nenhuma mudança é aplicada

---

## ✅ Comportamento Esperado  
Descreva o que deveria acontecer se o sistema estivesse funcionando corretamente.  
*Exemplo:*  
Após clicar em "Salvar", o modal deve fechar e as novas informações devem ser refletidas na interface e persistidas no banco de dados.

---

## 📷 Evidências (Logs / Prints / Vídeo)  
Adicione capturas de tela, vídeos ou trechos de log que ajudem a entender o bug.  
*Exemplo:*  
![erro-modal-config](https://link-da-imagem-ou-gif.com)

---

## 💻 Ambiente  
- Sistema operacional: `Windows 11`  
- Navegador: `Chrome 117.0`  
- Versão da aplicação: `v1.4.2`  
- Backend: `Node.js v18`  
- Frontend: `React 18`

---

## ⚠️ Prioridade  
- [ ] Baixa  
- [ ] Média  
- [ ] Alta  
- [ ] Crítica  

---

## ✅ Checklist de Correções  
Liste tarefas para corrigir e validar o bug:  
- [ ] Diagnosticar causa raiz  
- [ ] Corrigir função de envio de dados do modal  
- [ ] Validar com testes manuais  
- [ ] Adicionar teste automatizado para o caso  
- [ ] Validar no ambiente de homologação  

---

## 🧠 Notas Adicionais  
Inclua qualquer informação técnica relevante ou observações:  
*Exemplo:*  
- Bug começou a ocorrer após o PR #203  
- O `console.log()` do botão "Salvar" nunca é acionado  
- Endpoint `PATCH /api/user` não está sendo chamado
