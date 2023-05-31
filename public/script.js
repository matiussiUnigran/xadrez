const socket = io();

function gerarTabuleiro() {
  const tabuleiro = document.querySelector('.chessboard');
  tabuleiro.innerHTML = '';
  const casas = 64;
  const tamanhoQuadrado = 50;

  for (let i = 0; i < casas; i++) {
    const quadrado = document.createElement('div');

    const linha = Math.floor(i / 8);
    const coluna = i % 8;

    const cor = (linha + coluna) % 2 === 0 ? 'white' : 'black';
    quadrado.classList.add(cor);

    quadrado.style.width = tamanhoQuadrado + 'px';
    quadrado.style.height = tamanhoQuadrado + 'px';
    quadrado.id = `${8 - linha}-${coluna + 1}`;

    quadrado.addEventListener('click', selecionaCasa);

    tabuleiro.appendChild(quadrado);
  }

  document.body.appendChild(tabuleiro);
}

function colocarPecasNoTabuleiro(pecas) {
  const tabuleiro = document.getElementsByClassName('chessboard')[0];
  const quadrados = tabuleiro.getElementsByTagName('div');

  for (let i = 0; i < quadrados.length; i++) {
    quadrados[i].innerHTML = pecas[i];
  }
}

function marcarCasasDePossiveisMovimentos(posicao, movimentos) {
  if (movimentos.length === 0) {
    const id = posicao.toString().replace(',', '-');

    document.getElementById(id).classList.add('nenhum-movimento');
  } else {
    movimentos.forEach(movimento => {
      const id = movimento.toString().replace(',', '-');

      document.getElementById(id).classList.add('possivel-movimento');
    });

    const id = posicao.toString().replace(',', '-');

    document.getElementById(id).classList.add('selecionado');
  }
}

function selecionaCasa() {
  const posicao = this.id.split('-').map(v => Number(v));
  socket.emit('movimento', posicao);
}

socket.on('inicio', tabuleiro => {
  gerarTabuleiro();
  colocarPecasNoTabuleiro(tabuleiro);
});

socket.on('possiveis-movimentos', ({ movimentos, tabuleiro, posicao }) => {
  gerarTabuleiro();
  colocarPecasNoTabuleiro(tabuleiro);
  marcarCasasDePossiveisMovimentos(posicao, movimentos);
});

socket.on('movimentou', tabuleiro => {
  gerarTabuleiro();
  colocarPecasNoTabuleiro(tabuleiro);
});
