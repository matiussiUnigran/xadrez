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
  for (let i = 0; i < pecasBrancas.length; i++) {
    if (pecasBrancas[i] === peca) {
      return true;
    }
  }

  return false;
}

function pecaPreta(peca) {
  for (let i = 0; i < pecasPretas.length; i++) {
    if (pecasPretas[i] === peca) {
      return true;
    }
  }

  return false;
}

function verificarPeca(posicao) {
  const peca = tabuleiro[calcIndex(posicao[0], posicao[1])];

  if (peca === '♙' || peca === '♟') {
    pecaSelecionada.possiveisMovimentos = Peao.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Peao.movimento;
  }
  else if(peca === '♜' || peca === '♖'){
    pecaSelecionada.possiveisMovimentos = Torre.possiveisMovimentos(posicao);
    pecaSelecionada.posicao = posicao;
    pecaSelecionada.movimentar = Torre.movimento;
  } 
  else if (peca === '') {
    limparPeca()
  }

  return pecaSelecionada.possiveisMovimentos;
}

class Peca {
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
    if (tabuleiro[calcIndex(linha, coluna)] === '♙') {
      if (linha === 2) {
        for (let i = 1; i <= 2; i++) {
          if (tabuleiro[calcIndex(linha + i, coluna)] === '') {
            movimentos.push([linha + i, coluna]);
          } else {
            break;
          }
        }
      } else {
        if (tabuleiro[calcIndex(linha + 1, coluna)] === '') {
          movimentos.push([linha + 1, coluna]);
        }
      }
      if (coluna - 1 > 0) {
        if (pecaPreta(tabuleiro[calcIndex(linha + 1, coluna - 1)]))
          movimentos.push([linha + 1, coluna - 1]);
      }
      if (coluna + 1 <= 8) {
        if (pecaPreta(tabuleiro[calcIndex(linha + 1, coluna + 1)]))
          movimentos.push([linha + 1, coluna + 1]);
      }
    } else {
      if (linha === 7) {
        for (let i = 1; i <= 2; i++) {
          if (tabuleiro[calcIndex(linha - i, coluna)] === '') {
            movimentos.push([linha - i, coluna]);
          } else {
            break;
          }
        }
      } else {
        if (tabuleiro[calcIndex(linha - 1, coluna)] === '') {
          movimentos.push([linha - 1, coluna]);
        }
      }
      if (coluna - 1 > 0) {
        if (pecaBranca(tabuleiro[calcIndex(linha - 1, coluna - 1)]))
          movimentos.push([linha - 1, coluna - 1]);
      }
      if (coluna + 1 <= 8) {
        if (pecaBranca(tabuleiro[calcIndex(linha - 1, coluna + 1)]))
          movimentos.push([linha - 1, coluna + 1]);
      }
    }

    return movimentos;
  }
}

class Torre extends Peca {
  static verificaCampos(linha,coluna,color){
    let movimento = null;
    let continuar = true;
    if (tabuleiro[calcIndex(linha,coluna)] === ''){
      movimento = [linha,coluna]
    }
    else if(color === 'preto'){
      if (pecaBranca(tabuleiro[calcIndex(linha, coluna)])){
        movimento = [linha,coluna];

        continuar = false;
      }
      else{
        continuar = false;
      }
    }else{
      if (pecaBranca(tabuleiro[calcIndex(linha,coluna)])){
        continuar = false;
      }
      else{
        movimento = [linha, coluna];

        continuar = false;
      }
    }
    return {movimento, continuar};
  }

  static possiveisMovimentos(posicao) {
    const [linha, coluna] = posicao;
    const movimentos = [];
    const color = pecaBranca(tabuleiro[calcIndex(linha,coluna)]) ? 'branco' : 'preto';

    for(let i = coluna + 1 ; i <= 8 ; i++){
      const {continuar, movimento} = this.verificaCampos(linha,i,color);

      if (movimento){
        movimentos.push(movimento);
      }

      if (!continuar){
        break;
      }
    }

    for (let i = coluna - 1 ; i > 0 ; i--){
      const {continuar, movimento} = this.verificaCampos(linha,i,color);

      if (movimento){
        movimentos.push(movimento);
      }

      if (!continuar){
        break;
      }
    }

    for(let i = linha + 1 ; i <= 8 ; i++){
      const {continuar, movimento} = this.verificaCampos(i,coluna,color);

      if (movimento){
        movimentos.push(movimento);
      }

      if (!continuar){
        break;
      }
    }

    for(let i = linha - 1 ; i > 0 ; i--){
      const {continuar, movimento} = this.verificaCampos(i,coluna,color);

      if (movimento){
        movimentos.push(movimento);
      }

      if (!continuar){
        break;
      }
    }

    return movimentos
  }
}

class Cavalo {
  possiveisMovimentos() {}
}

class Bispo {
  movimento() {}

  possiveisMovimentos() {}
}

class Rainha {
  movimento() {}

  possiveisMovimentos() {}
}

class Rei {
  movimento() {}

  possiveisMovimentos() {}
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

function limparPeca(){
  pecaSelecionada.movimentar = posicao => {};
  pecaSelecionada.posicao = [];
  pecaSelecionada.possiveisMovimentos = [];
}

io.on('connection', socket => {
  reset();

  socket.on('movimento', posicao => {
    if (pecaSelecionada.possiveisMovimentos.length === 0) {
      const movimentos = verificarPeca(posicao);

      socket.emit('possiveis-movimentos', { movimentos, tabuleiro, posicao });
    } else {
      if (checarMovimento(posicao)) {
        pecaSelecionada.movimentar(posicao);

        limparPeca()

        socket.emit('movimentou', tabuleiro);
      } else {
        limparPeca()

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