# NEXTPLAY

PWA multimídia estático, pensado para iOS e Android, hospedável gratuitamente no GitHub Pages.

## Funcionalidades da versão inicial

- PWA instalável (manifest.json + service worker + ícones PNG).
- Player oficial incorporado do YouTube por link ou ID.
- Reprodução de arquivos locais de áudio/vídeo.
- Reprodução de URLs diretas de mídia em formatos comuns.
- Controles básicos, barra de progresso e Media Session API quando disponível.
- Interface responsiva, em português, com tema escuro roxo/laranja.
- Shell do aplicativo disponível offline após a primeira visita; mídia online não é armazenada em cache.

## Limitações e conformidade

- O YouTube é exibido no player oficial incorporado. O app não extrai áudio, não baixa vídeos, não remove anúncios, não esconde controles e não tenta manter o player do YouTube em segundo plano.
- A política para desenvolvedores do YouTube proíbe permitir reprodução em segundo plano do player incorporado: https://developers.google.com/youtube/terms/developer-policies-guide
- Use URLs diretas somente para arquivos que você possui ou tem autorização para reproduzir. CORS, autenticação, formatos e codecs podem impedir reprodução.
- A Media Session API pode expor metadados e controles de mídia, mas o suporte varia por navegador e sistema. Não garante execução em segundo plano em PWA.
- No iOS, um PWA não possui os mesmos modos de execução em segundo plano de um app nativo. Para uma experiência robusta de áudio bloqueado, seria necessário um app nativo com configuração de áudio em segundo plano e conteúdo/fonte autorizados.
- A biblioteca e os favoritos ainda não persistem nesta versão inicial.

## Publicar no GitHub Pages

1. Crie um repositório público (por exemplo `NEXTPLAY`).
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione `main` e `/ (root)` e salve.
6. Aguarde a publicação. O GitHub mostrará a URL HTTPS do site.

Se o repositório tiver outro nome, os caminhos relativos `./` usados neste projeto continuam funcionando em GitHub Pages.

## Instalar no celular

- **iPhone:** abra a URL publicada no Safari → Compartilhar → Adicionar à Tela de Início.
- **Android:** abra a URL no Chrome → menu → Instalar app / Adicionar à tela inicial.

O comportamento de instalação e mídia depende do navegador e da versão do sistema.

## Desenvolvimento local

Sirva a pasta por HTTP (por exemplo `python -m http.server 8000`) e abra `http://localhost:8000`. Service workers exigem HTTPS ou localhost.

## Próximas melhorias sugeridas

- Biblioteca com IndexedDB e playlists locais.
- Pesquisa de catálogo por provedores oficiais e APIs autorizadas.
- Importação de feeds/podcasts RSS e fontes abertas.
- Tela de configurações, acessibilidade e testes reais em Safari iOS e Chrome Android.
- Screenshots para a tela de instalação do PWA.
