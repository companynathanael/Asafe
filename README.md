# Asafe

Núcleo de IA's da Nathanael Industries — tema preto e vermelho.

**Estado atual:** sem conexão, o painel mostra uma demonstração. Conectado à API do Asafe
(repositório `companynathanael/NATHANAEL-INDUSTRIES`, pasta `asafe/`), as abas **Servidores**,
**Dados** e **Observador** mostram dados reais, e dá para **gerar servidores** de verdade.

### Conectar à API

```bash
ASAFE_ADMIN_TOKEN=um-token-secreto ASAFE_PAINEL=/caminho/para/este/repositorio python -m asafe
```

Abra http://127.0.0.1:8000/painel/, clique na pílula **"demonstração · conectar"** (canto superior direito) e cole o token.

## Responsabilidades do Asafe (refletidas nas abas)

| Aba | O que mostra |
| --- | --- |
| **Linhas Conexionais** | Quadro com o núcleo Asafe e as IA's. Uma *linha conexional* permite que uma IA opere **dentro** de outra (clicar, digitar, ler tela, pensar, executar). O painel lateral mostra a interface da IA operada em tempo real. O **Gather** (ciano) aparece conectado ao Asafe; as APIs ficam com ele. |
| **Servidores** | Servidores vigiados pelo Asafe: status, métricas, alertas, manutenção, comandos e **Gerar servidor** (cadastrar uma máquina existente ou criar uma nova num provedor). |
| **Dados** | Espaço usado por IA e backups (criar, baixar, apagar). |
| **Observador** | Auditoria real: tudo que cada IA fez na API (inclusive o que foi negado). |
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
