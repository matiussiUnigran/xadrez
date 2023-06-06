const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

let jogadoresAguardando = [];

[
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

class Jogador {
  constructor({ id, username }) {
    this.username = username
    this.id = id;
    this.xeque = false;
    this.roqueCurto = true;
    this.roqueGrande = true;
  }
}

class Jogo {
  constructor(jogador1, jogador2) {
    this.jogadorDeBrancas = new Jogador(jogador1);
    this.jogadorDePretas = new Jogador(jogador2);
    this.turno = 'branco';
    this.tabuleiro = this.resetTabuleiro();
    this.pecaSelecionada = new PecaSelecionada()
  }

  resetTabuleiro() {
    return [
      '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
      '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
      '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
    ];
  }

  movimentarPeca(posicaoAtual, posicaoNova) {
    const peca = this.tabuleiro[calcIndex(posicaoAtual[0], posicaoAtual[1])];
    const jogador = this.turno === 'branco' ? this.jogadorDeBrancas : this.jogadorDePretas;

    // Se a peça é um rei, o jogador não pode mais fazer roque
    if (peca === '♔' || peca === '♚') {
      jogador.roqueCurto = false;
      jogador.roqueGrande = false;
    }

    // Se a peça é uma torre, o jogador não pode mais fazer o roque do lado correspondente
    if (peca === '♖' || peca === '♜') {
      if (posicaoAtual[1] === 1) { // Torre do lado do roque grande
        jogador.roqueGrande = false;
      } else if (posicaoAtual[1] === 8) { // Torre do lado do roque curto
        jogador.roqueCurto = false;
      }
    }

    // Mover a peça no tabuleiro
    this.tabuleiro[calcIndex(posicaoAtual[0], posicaoAtual[1])] = '';
    this.tabuleiro[calcIndex(posicaoNova[0], posicaoNova[1])] = peca;

    // Se o movimento é um roque, mover a torre também
    if (Math.abs(posicaoAtual[1] - posicaoNova[1]) === 2 && (peca === '♔' || peca === '♚')) {
      const direcao = posicaoNova[1] > posicaoAtual[1] ? 1 : -1;
      const colunaTorreOrigem = direcao === 1 ? 8 : 1;
      const colunaTorreDestino = posicaoAtual[1] + direcao;

      const pecaTorre = this.tabuleiro[calcIndex(posicaoAtual[0], colunaTorreOrigem)];
      this.tabuleiro[calcIndex(posicaoAtual[0], colunaTorreOrigem)] = '';
      this.tabuleiro[calcIndex(posicaoAtual[0], colunaTorreDestino)] = pecaTorre;
    }

    // Trocar o turno
    this.turno = this.turno === 'branco' ? 'preto' : 'branco';
  }


}

class PecaSelecionada {
  constructor() {
    this.posicao = [];
    this.possiveisMovimentos = [];
  }

  movimentar(posicao) { }
}

const jogos = []


function cavalo(peca) {
  return ['♞', '♘'].includes(peca)
}

function bispo(peca) {
  return ['♝', '♗'].includes(peca)
}

function rainha(peca) {
  return ['♛', '♕'].includes(peca)
}

function torre(peca) {
  return ['♜', '♖'].includes(peca)
}

function calcIndex(l, c) {
  const linha = 8 - l;
  const coluna = c;
  return linha * 8 + coluna - 1;
}

function pecaBranca(peca) {
  return ['♙', '♖', '♘', '♗', '♕', '♔'].includes(peca)
}

function pecaPreta(peca) {
  return ['♜', '♞', '♝', '♛', '♚', '♟'].includes(peca)
}

function calcPosition(index) {
  const linha = 8 - Math.floor(index / 8);
  const coluna = index % 8 + 1;

  return [linha, coluna]
}

function encontraRei(tabuleiro, color) {
  let posicao = []
  tabuleiro.forEach((peca, index) => {
    if (color === 'branco') {
      if (peca === '♔') {
        posicao = calcPosition(index);
      }
    }
    else {
      if (peca === '♚') {
        posicao = calcPosition(index);
      }
    }
  });

  return posicao;
}

function estaSobAtaqueDePeao(posicao, color, tabuleiro) {
  const [linha, coluna] = posicao;
  const direcao = color === 'branco' ? 1 : -1;

  const novaLinha = linha + direcao;
  const posicoesParaVerificar = [coluna + 1, coluna - 1]; // positions to check

  // List of pieces that can be captured
  const peoes = ['♙', '♟'];

  // Check each position for a capturable piece
  for (let posicaoAtual of posicoesParaVerificar) {
    if (Peca.verificaPecaCapturavel([novaLinha, posicaoAtual], color, tabuleiro)) {
      const peca = tabuleiro[calcIndex(novaLinha, posicaoAtual)];
      if (peoes.includes(peca)) {
        return true;
      }
    }
  }

  return false;
}

class Peca {

  static verificaXequeMate(tabuleiro, color, jogador) {
    const minhaPeca = color === 'branco' ? pecaBranca : pecaPreta;
    let xequeMate = true;
    tabuleiro.map((peca, index) => {
      if (minhaPeca(peca)) {
        const posicao = calcPosition(index);

        const { possiveisMovimentos } = verificarPeca(posicao, tabuleiro, jogador);
        if (possiveisMovimentos.length !== 0) {
          xequeMate = false;
          return null;
        }
      }
    })

    return xequeMate;
  }

  static verificaDirecao(direcoes, posicao, color, pecaInimiga, tabuleiro) {
    const [linha, coluna] = posicao;
    for (const direcao of direcoes) {
      for (let i = 1; i <= 8; i++) {
        const novaLinha = linha + direcao.linha * i;
        const novaColuna = coluna + direcao.coluna * i;

        const peca = tabuleiro[calcIndex(novaLinha, novaColuna)]

        if (
          novaLinha < 1 ||
          novaLinha > 8 ||
          novaColuna < 1 ||
          novaColuna > 8
        ) {
          break;
        }

        const { continuar, movimento } = this.verificaCampo([novaLinha, novaColuna], color, tabuleiro);
        if (movimento) {
          if (pecaInimiga(peca)) {
            return true;
          }

        }

        if (!continuar) {
          break;
        }
      }
    }
  }

  static estaSobAtaqueDeAlgumaPeca(posicao, tabuleiro, color) {
    const direcoes = {
      linha: [
        { linha: 0, coluna: 1 }, // direita
        { linha: 0, coluna: -1 }, // esquerda
        { linha: 1, coluna: 0 }, // para cima
        { linha: -1, coluna: 0 } // para baixo
      ],

      diagonal: [
        { linha: 1, coluna: 1 }, // diagonal superior direita
        { linha: 1, coluna: -1 }, // diagonal superior esquerda
        { linha: -1, coluna: 1 }, // diagonal inferior direita
        { linha: -1, coluna: -1 } // diagonal inferior esquerda
      ],

      cavalo: [
        { linha: 2, coluna: 1 },
        { linha: 2, coluna: -1 },
        { linha: -2, coluna: 1 },
        { linha: -2, coluna: -1 },
        { linha: 1, coluna: 2 },
        { linha: 1, coluna: -2 },
        { linha: -1, coluna: 2 },
        { linha: -1, coluna: -2 }
      ]
    };

    if (estaSobAtaqueDePeao(posicao, color, tabuleiro)) {
      return true
    }
    else if (this.verificaDirecao(direcoes.linha, posicao, color, (peca) => rainha(peca) || torre(peca), tabuleiro)) {
      return true;
    }
    else if (this.verificaDirecao(direcoes.diagonal, posicao, color, (peca) => rainha(peca) || bispo(peca), tabuleiro)) {
      return true
    }
    else if (this.verificaDirecao(direcoes.cavalo, posicao, color, (peca) => cavalo(peca), tabuleiro)) {
      return true;
    }

    return false;
  }

  static verificaXeque(tabuleiro, color) {
    const rei = encontraRei(tabuleiro, color);

    return this.estaSobAtaqueDeAlgumaPeca(rei, tabuleiro, color);
  }

  static verificaCampoVazio(posicao, tabuleiro) {
    const [linha, coluna] = posicao
    const peca = tabuleiro[calcIndex(linha, coluna)];
    return peca === '';
  }

  static verificaPecaCapturavel(posicao, color, tabuleiro) {
    const [linha, coluna] = posicao;
    const peca = tabuleiro[calcIndex(linha, coluna)];
    const isPecaBranca = pecaBranca(peca);
    const isPecaPreta = pecaPreta(peca);

    return (
      (color === 'preto' && isPecaBranca) || (color === 'branco' && isPecaPreta)
    );
  }

  static verificaCampo(posicao, color, tabuleiro) {
    const isCampoVazio = this.verificaCampoVazio(posicao, tabuleiro);
    const isPecaCapturavel = this.verificaPecaCapturavel(posicao, color, tabuleiro);

    const movimento = isCampoVazio || isPecaCapturavel ? posicao : null;
    const continuar = isCampoVazio;

    return { movimento, continuar };
  }

  static possiveisMovimentosLineares(posicao, tabuleiro, direcoes, passos = 8) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

    for (const direcao of direcoes) {
      for (let i = 1; i <= passos; i++) {
        const novaLinha = linha + direcao.linha * i;
        const novaColuna = coluna + direcao.coluna * i;

        if (
          novaLinha < 1 ||
          novaLinha > 8 ||
          novaColuna < 1 ||
          novaColuna > 8
        ) {
          break;
        }

        const { continuar, movimento } = this.verificaCampo([novaLinha, novaColuna], color, tabuleiro);

        if (movimento) {
          const tabuleiroTeste = [...tabuleiro];
          this.movimento(posicao, movimento, tabuleiroTeste);
          if (!this.verificaXeque(tabuleiroTeste, color)) {
            movimentos.push(movimento);
          }
        }

        if (!continuar) {
          break;
        }
      }
    }

    return movimentos;
  }

  static movimento(posicaoAtual, posicaoNova, tabuleiro) {
    const [linhaAtual, colunaAtual] = posicaoAtual;
    const [linha, coluna] = posicaoNova;
    const peca = tabuleiro[calcIndex(linhaAtual, colunaAtual)];

    tabuleiro[calcIndex(linhaAtual, colunaAtual)] = '';
    tabuleiro[calcIndex(linha, coluna)] = peca;
  }
}

class Peao extends Peca {
  static possiveisMovimentos(posicao, tabuleiro) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';
    const direcao = color === 'branco' ? 1 : -1;
    const linhaInicial = color === 'branco' ? 2 : 7;

    if (linha === linhaInicial) {
      for (let i = 1; i <= 2; i++) {
        if (this.verificaCampoVazio([linha + i * direcao, coluna], tabuleiro)) {
          const posicaoNova = [linha + i * direcao, coluna];
          const tabuleiroTeste = [...tabuleiro];
          this.movimento(posicao, posicaoNova, tabuleiroTeste)
          if (!this.verificaXeque(tabuleiroTeste, color)) {
            movimentos.push(posicaoNova);
          }
        } else {
          break;
        }
      }
    } else {
      if (this.verificaCampoVazio([linha + 1 * direcao, coluna], tabuleiro)) {
        let posicaoNova = [linha + 1 * direcao, coluna];
        let tabuleiroTeste = [...tabuleiro];
        this.movimento(posicao, posicaoNova, tabuleiroTeste)
        if (!this.verificaXeque(tabuleiroTeste, color)) {
          movimentos.push(posicaoNova);
        }
      }
    }

    if (coluna - 1 > 0) {
      if (this.verificaPecaCapturavel([linha + 1 * direcao, coluna - 1], color, tabuleiro)) {
        const posicaoNova = [linha + 1 * direcao, coluna - 1];
        const tabuleiroTeste = [...tabuleiro];
        this.movimento(posicao, posicaoNova, tabuleiroTeste)
        if (!this.verificaXeque(tabuleiroTeste, color)) {
          movimentos.push(posicaoNova);
        }
      }
    }
    if (coluna + 1 <= 8) {
      if (this.verificaPecaCapturavel([linha + 1 * direcao, coluna + 1], color, tabuleiro)) {
        const posicaoNova = [linha + 1 * direcao, coluna + 1];
        const tabuleiroTeste = [...tabuleiro];
        this.movimento(posicao, posicaoNova, tabuleiroTeste)
        if (!this.verificaXeque(tabuleiroTeste, color)) {
          movimentos.push(posicaoNova);
        }
      }
    }

    return movimentos;
  }
}

class Torre extends Peca {
  static possiveisMovimentos(posicao, tabuleiro) {
    const direcoes = [
      { linha: 0, coluna: 1 }, // direita
      { linha: 0, coluna: -1 }, // esquerda
      { linha: 1, coluna: 0 }, // para cima
      { linha: -1, coluna: 0 } // para baixo
    ];

    return this.possiveisMovimentosLineares(posicao, tabuleiro, direcoes)
  }
}

class Cavalo extends Peca {
  static possiveisMovimentos(posicao, tabuleiro) {
    const direcoes = [
      { linha: 2, coluna: 1 },
      { linha: 2, coluna: -1 },
      { linha: -2, coluna: 1 },
      { linha: -2, coluna: -1 },
      { linha: 1, coluna: 2 },
      { linha: 1, coluna: -2 },
      { linha: -1, coluna: 2 },
      { linha: -1, coluna: -2 }
    ];

    return this.possiveisMovimentosLineares(posicao, tabuleiro, direcoes, 1)
  }
}

class Bispo extends Peca {
  static possiveisMovimentos(posicao, tabuleiro) {
    const direcoes = [
      { linha: 1, coluna: 1 }, // diagonal superior direita
      { linha: 1, coluna: -1 }, // diagonal superior esquerda
      { linha: -1, coluna: 1 }, // diagonal inferior direita
      { linha: -1, coluna: -1 } // diagonal inferior esquerda
    ];

    return this.possiveisMovimentosLineares(posicao, tabuleiro, direcoes)
  }
}

class Rainha extends Peca {
  static possiveisMovimentos(posicao, tabuleiro) {
    const direcoes = [
      { linha: 0, coluna: 1 }, // direita
      { linha: 0, coluna: -1 }, // esquerda
      { linha: 1, coluna: 0 }, // para cima
      { linha: -1, coluna: 0 }, // para baixo
      { linha: 1, coluna: 1 }, // diagonal superior direita
      { linha: 1, coluna: -1 }, // diagonal superior esquerda
      { linha: -1, coluna: 1 }, // diagonal inferior direita
      { linha: -1, coluna: -1 } // diagonal inferior esquerda
    ];

    return this.possiveisMovimentosLineares(posicao, tabuleiro, direcoes)
  }
}

class Rei extends Peca {
  static possiveisMovimentos(posicao, tabuleiro, jogador) {
    const direcoes = [
      { linha: 0, coluna: 1 }, // direita
      { linha: 0, coluna: -1 }, // esquerda
      { linha: 1, coluna: 0 }, // para cima
      { linha: -1, coluna: 0 }, // para baixo
      { linha: 1, coluna: 1 }, // diagonal superior direita
      { linha: 1, coluna: -1 }, // diagonal superior esquerda
      { linha: -1, coluna: 1 }, // diagonal inferior direita
      { linha: -1, coluna: -1 } // diagonal inferior esquerda
    ];

    let movimentos = this.possiveisMovimentosLineares(posicao, tabuleiro, direcoes, 1);
    const color = pecaBranca(tabuleiro[calcIndex(posicao[0], posicao[1])]) ? 'branco' : 'preto'

    if (!this.verificaXeque(tabuleiro, color)) {
      if (jogador.roqueCurto && this.verificaRoque(posicao, tabuleiro, 'curto')) {
        movimentos.push([posicao[0], posicao[1] + 2]);
      }
      if (jogador.roqueGrande && this.verificaRoque(posicao, tabuleiro, 'grande')) {
        movimentos.push([posicao[0], posicao[1] - 2]);
      }

    }

    return movimentos;
  }

  static verificaRoque(posicao, tabuleiro, tipo) {
    const [linha, coluna] = posicao;
    const direcao = tipo === 'curto' ? 1 : -1;
    const casas = tipo === 'curto' ? 2 : 3;
    const color = linha === 1 ? 'branco' : 'preto';

    for (let i = 1; i <= casas; i++) {
      const novaColuna = coluna + direcao * i;
      if (!this.verificaCampoVazio([linha, novaColuna], tabuleiro) || this.estaSobAtaqueDeAlgumaPeca([linha, novaColuna], tabuleiro, color)) {
        return false;
      }
    }

    return true;
  }
}

function checarMovimento(posicao, pecaSelecionada) {
  for (let i = 0; i < pecaSelecionada.possiveisMovimentos.length; i++) {
    if (
      pecaSelecionada.possiveisMovimentos[i].toString() === posicao.toString()
    ) {
      return true;
    }
  }

  return false;
}

const pecas = {
  '♙': Peao,
  '♟': Peao,
  '♜': Torre,
  '♖': Torre,
  '♞': Cavalo,
  '♘': Cavalo,
  '♝': Bispo,
  '♗': Bispo,
  '♛': Rainha,
  '♕': Rainha,
  '♚': Rei,
  '♔': Rei,
};

function verificarPeca(posicao, tabuleiro, jogador) {
  const peca = tabuleiro[calcIndex(posicao[0], posicao[1])];
  let pecaSelecionada = {
    possiveisMovimentos: [],
    posicao: [],
    movimentar: (posicao, tabuleiro) => { }
  };

  if (peca in pecas) {
    pecaSelecionada = {
      possiveisMovimentos: pecas[peca].possiveisMovimentos(posicao, tabuleiro, jogador),
      posicao: posicao,
      movimentar: pecas[peca].movimento,
    };
  }

  return pecaSelecionada;
}

io.on('connection', socket => {

  socket.on('entrou', (username) => {
    jogadoresAguardando.push({ id: socket.id, username });

    if (jogadoresAguardando.length >= 2) {
      const index = jogos.push(new Jogo(jogadoresAguardando[0], jogadoresAguardando[1])) - 1;

      io.to(jogadoresAguardando[0].id).emit('inicio', jogos[index]);
      io.to(jogadoresAguardando[1].id).emit('inicio', jogos[index]);

      jogadoresAguardando.shift();
      jogadoresAguardando.shift();

    }
  })

  socket.on('movimento', posicao => {
    const jogosEncontrados = jogos.filter(jogo => jogo.jogadorDeBrancas.id === socket.id || jogo.jogadorDePretas.id === socket.id);

    if (jogosEncontrados.length === 0) {
      return null;
    }

    const [jogo] = jogosEncontrados;
    const jogador = jogo.turno === 'branco' ? jogo.jogadorDeBrancas : jogo.jogadorDePretas;
    const pecaCerta = jogo.turno === 'branco' ? pecaBranca : pecaPreta;
    const peca = jogo.tabuleiro[calcIndex(posicao[0], posicao[1])];

    if (jogador.id !== socket.id) {
      socket.emit('possiveis-movimentos', { movimentos: [], tabuleiro: jogo.tabuleiro, posicao });
    }
    else if (jogo.pecaSelecionada.possiveisMovimentos.length === 0) {
      let movimentos = [];

      if (pecaCerta(peca)) {
        jogo.pecaSelecionada = verificarPeca(posicao, jogo.tabuleiro, jogador);

        movimentos = jogo.pecaSelecionada.possiveisMovimentos;
      }

      socket.emit('possiveis-movimentos', { movimentos, tabuleiro: jogo.tabuleiro, posicao });
    } else {
      if (checarMovimento(posicao, jogo.pecaSelecionada)) {
        jogo.movimentarPeca(jogo.pecaSelecionada.posicao, posicao, jogo.tabuleiro);

        jogo.pecaSelecionada = new PecaSelecionada();

        io.to(jogo.jogadorDeBrancas.id).emit('movimentou', jogo);
        io.to(jogo.jogadorDePretas.id).emit('movimentou', jogo);

        if (Peca.verificaXequeMate(jogo.tabuleiro, jogo.turno, jogador)) {
          io.to(jogo.jogadorDeBrancas.id).emit('xequeMate', jogo.turno);
          io.to(jogo.jogadorDePretas.id).emit('xequeMate', jogo.turno);
        }
      } else {
        jogo.pecaSelecionada = new PecaSelecionada();

        let movimentos = []
        if (pecaCerta(peca)) {
          jogo.pecaSelecionada = verificarPeca(posicao, jogo.tabuleiro, jogador);

          movimentos = jogo.pecaSelecionada.possiveisMovimentos;
        }


        socket.emit('possiveis-movimentos', { movimentos, tabuleiro: jogo.tabuleiro, posicao });
      }
    }
  });

  socket.on('disconnect', () => {
    const jogosEncontrados = jogos.map((jogo, index) => {
      if (jogo.jogadorDeBrancas.id === socket.id || jogo.jogadorDePretas.id === socket.id) {
        return index;
      }
      else {
        return -1;
      }
    }).filter(v => v !== -1);

    if (jogosEncontrados.length === 0) {
      jogadoresAguardando = jogadoresAguardando.filter(jogador => jogador.id !== socket.id);
    }
    else {
      io.to(jogos[jogosEncontrados[0]].jogadorDeBrancas.id).emit('desconectou', jogos[jogosEncontrados[0]].jogadorDePretas.username);
      io.to(jogos[jogosEncontrados[0]].jogadorDePretas.id).emit('desconectou', jogos[jogosEncontrados[0]].jogadorDeBrancas.username);

      jogos.slice(jogosEncontrados[0], 1);
    }
  })
});

app
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .get('/', (req, res) => {
    return res.sendFile('index.html', { root: __dirname });
  });

app.use((req, res, next) => {
  res.status(404).sendFile('404.html', { root: __dirname });
});


server.listen(8000, '0.0.0.0');
