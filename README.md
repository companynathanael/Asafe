# Asafe

Núcleo de IA's da Nathanael Industries — tema preto e vermelho.

**Estado atual:** apenas a aparência (interface). Todos os dados são simulados.

## Responsabilidades do Asafe (refletidas nas abas)

| Aba | O que mostra |
| --- | --- |
| **Linhas Conexionais** | Quadro com o núcleo Asafe e as IA's. Uma *linha conexional* permite que uma IA opere **dentro** de outra (clicar, digitar, ler tela, pensar, executar). O painel lateral mostra a interface da IA operada em tempo real. O **Gather** (ciano) aparece conectado ao Asafe; as APIs ficam com ele. |
| **Servidores** | Servidores/logins gerados pelo Asafe para cada IA. |
| **Dados** | Armazenamento por IA e coleções. |
| **Observador** | Feed ao vivo das ações entre IA's. |
| **Permissões** | Pedidos pendentes e permissões ativas. |

## Rodar

É um site estático, sem build:

```bash
python3 -m http.server 8080
```

Depois abra http://localhost:8080 (ou abra `index.html` direto no navegador).

## Arquivos

- `index.html` — estrutura
- `styles.css` — tema preto & vermelho
- `app.js` — interações do quadro (arrastar, zoom, seleção) e simulações
- `assets/` — logo do Asafe (símbolo, wordmark, favicon)
