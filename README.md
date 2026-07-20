# Mega Feirão Metal Nobre

Aplicativo interno para organizar a fila de vendedores durante o Mega Feirão Metal Nobre.

## Funcionamento

- O vendedor entra com usuário e PIN.
- Ao ficar disponível, entra no fim da fila.
- Ao iniciar atendimento, sai da fila e fica vermelho.
- A recepção vê o próximo vendedor, a fila completa e quem está atendendo.
- As telas atualizam automaticamente a cada segundo.

## Usuários iniciais

Os vendedores estão cadastrados como `vendedor1` até `vendedor8`, com PINs `1111` até `8888`.

A recepção usa:

```text
Usuário: recepcao
PIN: 9999
```

Para trocar nomes, usuários ou PINs, edite apenas `lib/config.ts`.

## Executar no servidor

Requisito: Node.js 20 ou superior.

```bash
git clone https://github.com/developmentconexus-ops/mega-feirao-mn.git
cd mega-feirao-mn
npm install
npm run build
npm start
```

O aplicativo ficará acessível em:

```text
http://192.168.0.3:3000
```

O servidor e os celulares precisam estar na mesma rede. Libere a porta TCP `3000` no firewall do servidor.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Persistência

O estado da fila fica em `data/state.json`. Todos começam como **Em atendimento**, e entram voluntariamente na fila ao tocar em **Finalizar e ficar disponível**.
