const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const pecaSelecionada = {
  posicao: [],
  possiveisMovimentos: [],
  movimentar: posicao => {}
};

const pecasPretas = ['♜', '♞', '♝', '♛', '♚', '♟'];

const pecasBrancas = ['♙', '♖', '♘', '♗', '♕', '♔'];

function cavalo(peca){
  return ['♞','♘'].includes(peca)
}

function bispo(peca){
  return ['♝','♗'].includes(peca)
}

function rainha(peca){
  return ['♛','♕'].includes(peca)
}

function torre(peca){
  return ['♜','♖'].includes(peca)
}

let tabuleiro = [
  '♜',
  '♞',
  '♝',
  '♛',
  '♚',
  '♝',
  '♞',
  '♜',
  '♟',
  '♟',
  '♟',
  '♟',
  '♟',
  '♟',
  '♟',
  '♟',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '♙',
  '♙',
  '♙',
  '♙',
  '♙',
  '♙',
  '♙',
  '♙',
  '♖',
  '♘',
  '♗',
  '♕',
  '♔',
  '♗',
  '♘',
  '♖'
];

function calcIndex(l, c) {
  const linha = 8 - l;
  const coluna = c;
  return linha * 8 + coluna - 1;
}

function reset() {
  const tabuleiroInicial = [
    '♜',
    '♞',
    '♝',
    '♛',
    '♚',
    '♝',
    '♞',
    '♜',
    '♟',
    '♟',
    '♟',
    '♟',
    '♟',
    '♟',
    '♟',
    '♟',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '♙',
    '♙',
    '♙',
    '♙',
    '♙',
    '♙',
    '♙',
    '♙',
    '♖',
    '♘',
    '♗',
    '♕',
    '♔',
    '♗',
    '♘',
    '♖'
  ];

  tabuleiro = tabuleiroInicial;
}

function pecaBranca(peca) {
  return pecasBrancas.includes(peca)
}

function pecaPreta(peca) {
  return pecasPretas.includes(peca)
}

function verificarPeca(posicao) {
  const peca = tabuleiro[calcIndex(posicao[0], posicao[1])];

  if (peca === '♙' || peca === '♟') {
    pecaSelecionada.possiveisMovimentos = Peao.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Peao.movimento;
  } else if (peca === '♜' || peca === '♖') {
    pecaSelecionada.possiveisMovimentos = Torre.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Torre.movimento;
  } else if (peca === '♞' || peca === '♘') {
    pecaSelecionada.possiveisMovimentos = Cavalo.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Cavalo.movimento;
  } else if (peca === '♝' || peca === '♗') {
    pecaSelecionada.possiveisMovimentos = Bispo.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Bispo.movimento;
  } else if (peca === '♛' || peca === '♕') {
    pecaSelecionada.possiveisMovimentos = Rainha.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Rainha.movimento;
  } else if (peca === '♚' || peca === '♔') {
    pecaSelecionada.possiveisMovimentos = Rei.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Rei.movimento;
  } else if (peca === '') {
    limparPeca();
  }

  return pecaSelecionada.possiveisMovimentos;
}

function calcPosition(index){
  const linha =  8 - Math.floor(index / 8);
  const coluna = index % 8 + 1;

  return [linha,coluna]
}

function encontraRei(tabuleiro,color){
  let posicao = []
  tabuleiro.forEach((peca, index) => {
    if (color === 'branco'){
      if (peca === '♔'){
        posicao = calcPosition(index);
      }
    }
    else{
      if (peca === '♚'){
        posicao = calcPosition(index);
      }
    }
  });

  return posicao;
}

function peao(posicao,color){
  const [linha, coluna] = posicao;
  const direcao = color === 'branco' ? 1 : -1;

  const novaLinha = linha + direcao;
  const direita = coluna + 1;
  const esquerda = coluna - 1;
    
  if(Peca.verificaPecaCapturavel(novaLinha,direita,color)){
    if (['♙','♟'].includes(tabuleiro[calcIndex(novaLinha,direita)])){
      return true;
    }
  }
  else if(Peca.verificaPecaCapturavel(novaLinha,esquerda,color)){
    if (['♙','♟'].includes(tabuleiro[calcIndex(novaLinha,esquerda)])){
      return true;
    }
  }

  return false;
}

class Peca {

  static verificaDirecao(direcoes,posicao,color,pecaInimiga){
    const [linha,coluna] = posicao
    for (const direcao of direcoes) {
      for (let i = 1; i <= 8; i++) {
        const novaLinha = linha + direcao.linha * i;
        const novaColuna = coluna + direcao.coluna * i;
        
        const peca = tabuleiro[calcIndex(novaLinha,novaColuna)]

        if (
          novaLinha < 1 ||
          novaLinha > 8 ||
          novaColuna < 1 ||
          novaColuna > 8
        ) {
          break;
        }

        const { continuar, movimento } = this.verificaCampo(
          novaLinha,
          novaColuna,
          color
        );
        if (!continuar, movimento) {
          if (pecaInimiga(peca)){
            return true;
          }
          break;
        }
      }
    }
  }
  static verificaXeque(tabuleiro, color){
    const [linha,coluna] = encontraRei(tabuleiro, color);
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

    if (peao([linha,coluna], color)){
      return true
    }
    else if (this.verificaDirecao(direcoes.linha, [linha,coluna], color, (peca)=> rainha(peca)||torre(peca))){
      return true;
    }
    else if (this.verificaDirecao(direcoes.diagonal, [linha,coluna], color, (peca)=> rainha(peca) || bispo(peca))){
      return true
    }
    else if (this.verificaDirecao(direcoes.cavalo, [linha,coluna], color, (peca) => cavalo(peca))){
      return true;
    }

    return false;
  }

  static verificaCampoVazio(linha, coluna) {
    const peca = tabuleiro[calcIndex(linha, coluna)];
    return peca === '';
  }

  static verificaPecaCapturavel(linha, coluna, color) {
    const peca = tabuleiro[calcIndex(linha, coluna)];
    const isPecaBranca = pecaBranca(peca);
    const isPecaPreta = pecaPreta(peca);

    return (
      (color === 'preto' && isPecaBranca) || (color === 'branco' && isPecaPreta)
    );
  }

  static verificaCampo(linha, coluna, color) {
    const isCampoVazio = this.verificaCampoVazio(linha, coluna);
    const isPecaCapturavel = this.verificaPecaCapturavel(linha, coluna, color);

    const movimento = isCampoVazio || isPecaCapturavel ? [linha, coluna] : null;
    const continuar = isCampoVazio;

    return { movimento, continuar };
  }

  static movimento(posicao) {
    const [linhaAtual, colunaAtual] = pecaSelecionada.posicao;
    const [linha, coluna] = posicao;
    const peca = tabuleiro[calcIndex(linhaAtual, colunaAtual)];

    tabuleiro[calcIndex(linhaAtual, colunaAtual)] = '';
    tabuleiro[calcIndex(linha, coluna)] = peca;
  }
}

class Peao extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';
    const direcao = color === 'branco' ? 1 : -1;
    const linhaInicial = color === 'branco' ? 2 : 7;

    if (linha === linhaInicial) {
      for (let i = 1; i <= 2; i++) {
        if (this.verificaCampoVazio(linha + i * direcao, coluna)) {
          movimentos.push([linha + i * direcao, coluna]);
        } else {
          break;
        }
      }
    } else {
      if (this.verificaCampoVazio(linha + 1 * direcao, coluna)) {
        movimentos.push([linha + 1 * direcao, coluna]);
      }
    }

    if (coluna - 1 > 0) {
      if (this.verificaPecaCapturavel(linha + 1 * direcao, coluna - 1, color))
        movimentos.push([linha + 1 * direcao, coluna - 1]);
    }
    if (coluna + 1 <= 8) {
      if (this.verificaPecaCapturavel(linha + 1 * direcao, coluna + 1, color))
        movimentos.push([linha + 1 * direcao, coluna + 1]);
    }

    return movimentos;
  }
}

class Torre extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

    const direcoes = [
      { linha: 0, coluna: 1 }, // direita
      { linha: 0, coluna: -1 }, // esquerda
      { linha: 1, coluna: 0 }, // para cima
      { linha: -1, coluna: 0 } // para baixo
    ];

    for (const direcao of direcoes) {
      for (let i = 1; i <= 8; i++) {
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

        const { continuar, movimento } = this.verificaCampo(
          novaLinha,
          novaColuna,
          color
        );

        if (movimento) {
          movimentos.push(movimento);
        }

        if (!continuar) {
          break;
        }
      }
    }

    return movimentos;
  }
}

class Cavalo extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

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

    for (const direcao of direcoes) {
      const novaLinha = linha + direcao.linha;
      const novaColuna = coluna + direcao.coluna;

      if (
        novaLinha >= 1 &&
        novaLinha <= 8 &&
        novaColuna >= 1 &&
        novaColuna <= 8
      ) {
        const { movimento } = this.verificaCampo(novaLinha, novaColuna, color);

        if (movimento) {
          movimentos.push(movimento);
        }
      }
    }

    return movimentos;
  }
}

class Bispo extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

    const direcoes = [
      { linha: 1, coluna: 1 }, // diagonal superior direita
      { linha: 1, coluna: -1 }, // diagonal superior esquerda
      { linha: -1, coluna: 1 }, // diagonal inferior direita
      { linha: -1, coluna: -1 } // diagonal inferior esquerda
    ];

    for (const direcao of direcoes) {
      for (let i = 1; i <= 8; i++) {
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

        const { continuar, movimento } = this.verificaCampo(
          novaLinha,
          novaColuna,
          color
        );

        if (movimento) {
          movimentos.push(movimento);
        }

        if (!continuar) {
          break;
        }
      }
    }

    return movimentos;
  }
}

class Rainha extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

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

    for (const direcao of direcoes) {
      for (let i = 1; i <= 8; i++) {
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

        const { continuar, movimento } = this.verificaCampo(
          novaLinha,
          novaColuna,
          color
        );

        if (movimento) {
          movimentos.push(movimento);
        }

        if (!continuar) {
          break;
        }
      }
    }

    return movimentos;
  }
}

class Rei extends Peca {
  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha, coluna)])
      ? 'branco'
      : 'preto';

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

    for (const direcao of direcoes) {
      const novaLinha = linha + direcao.linha;
      const novaColuna = coluna + direcao.coluna;

      if (
        novaLinha > 0 &&
        novaLinha <= 8 &&
        novaColuna > 0 &&
        novaColuna <= 8
      ) {
        const { movimento } = this.verificaCampo(novaLinha, novaColuna, color);

        if (movimento) {
          movimentos.push(movimento);
        }
      }
    }

    return movimentos;
  }
}

function checarMovimento(posicao) {
  for (let i = 0; i < pecaSelecionada.possiveisMovimentos.length; i++) {
    if (
      pecaSelecionada.possiveisMovimentos[i].toString() === posicao.toString()
    ) {
      return true;
    }
  }

  return false;
}

function limparPeca() {
  pecaSelecionada.movimentar = posicao => {};
  pecaSelecionada.posicao = [];
  pecaSelecionada.possiveisMovimentos = [];
}

io.on('connection', socket => {
  reset();

  socket.on('movimento', posicao => {
    if (Peca.verificaXeque(tabuleiro, 'preto')){
      console.log('xeque preto')
    }
    if (Peca.verificaXeque(tabuleiro, 'branco')){
      console.log('xeque branco')

    }
    if (pecaSelecionada.possiveisMovimentos.length === 0) {
      const movimentos = verificarPeca(posicao);

      socket.emit('possiveis-movimentos', { movimentos, tabuleiro, posicao });
    } else {
      if (checarMovimento(posicao)) {
        pecaSelecionada.movimentar(posicao);

        limparPeca();

        socket.emit('movimentou', tabuleiro);
      } else {
        limparPeca();

        const movimentos = verificarPeca(posicao);

        socket.emit('possiveis-movimentos', { movimentos, tabuleiro, posicao });
      }
    }
  });

  socket.emit('inicio', tabuleiro);
});

app
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .get('/', (req, res) => {
    return res.sendFile('index.html', { root: __dirname });
  });
server.listen(8000);
