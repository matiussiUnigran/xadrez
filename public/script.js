const socket = io();

const pecas = {
  '♙': `<iconify-icon icon="fa6-regular:chess-pawn"></iconify-icon>`,
  '♟': `<iconify-icon icon="fa6-solid:chess-pawn"></iconify-icon>`,
  '♜': `<iconify-icon icon="fa6-solid:chess-rook"></iconify-icon>`,
  '♖': `<iconify-icon icon="fa6-regular:chess-rook"></iconify-icon>`,
  '♞': `<iconify-icon icon="fa6-solid:chess-knight"></iconify-icon>`,
  '♘': `<iconify-icon icon="fa6-regular:chess-knight"></iconify-icon>`,
  '♝': `<iconify-icon icon="fa6-solid:chess-bishop"></iconify-icon>`,
  '♗': `<iconify-icon icon="fa6-regular:chess-bishop"></iconify-icon>`,
  '♛': `<iconify-icon icon="fa6-solid:chess-queen"></iconify-icon>`,
  '♕': `<iconify-icon icon="fa6-regular:chess-queen"></iconify-icon>`,
  '♚': `<iconify-icon icon="fa6-solid:chess-king"></iconify-icon>`,
  '♔': `<iconify-icon icon="fa6-regular:chess-king"></iconify-icon>`,
  '': ''
};

function gerarTabuleiro(jogadorDePretas) {
  const tabuleiro = document.createElement('div');
  tabuleiro.classList.add('chessboard');
  tabuleiro.innerHTML = '';
  const linhas = 8;
  const colunas = 8;
  const tamanhoQuadrado = 50;

  for (let i = 0; i < linhas; i++) {
    const linhaDiv = document.createElement('div');
    linhaDiv.classList.add('linha')

    for (let j = 0; j < colunas; j++) {
      const quadrado = document.createElement('div');
      quadrado.classList.add('coluna');
      const cor = (i + j) % 2 === 0 ? 'white' : 'black';

      if (jogadorDePretas) {
        quadrado.classList.add(cor);

        quadrado.id = `${i + 1}-${8 - j}`;
      }
      else {
        quadrado.classList.add(cor);

        quadrado.id = `${8 - i}-${j + 1}`;
      }

      quadrado.addEventListener('click', selecionaCasa);

      linhaDiv.appendChild(quadrado);
    }

    tabuleiro.appendChild(linhaDiv);
  }

  document.body.appendChild(tabuleiro);
}

function colocarPecasNoTabuleiro(tabuleiro, jogadorDePretas) {
  const quadrados = document.querySelectorAll('.chessboard div div');

  if (jogadorDePretas) {
    for (let i = 0; i < quadrados.length; i++) {
      if (quadrados[i].innerHTML !== pecas[tabuleiro[quadrados.length - i - 1]]) {
        quadrados[i].innerHTML = pecas[tabuleiro[quadrados.length - i - 1]];
      }
    }
  }
  else {
    for (let i = 0; i < quadrados.length; i++) {
      if (quadrados[i].innerHTML !== pecas[tabuleiro[i]]) {
        quadrados[i].innerHTML = pecas[tabuleiro[i]];
      }
    }
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

socket.on('inicio', jogo => {
  console.log(jogo)
  if (jogo.jogadorDeBrancas.id === socket.id) {
    gerarTabuleiro();
    colocarPecasNoTabuleiro(jogo.tabuleiro);
  }
  else {
    gerarTabuleiro(true);
    colocarPecasNoTabuleiro(jogo.tabuleiro, true);
  }

  if (jogo.turno === 'branco') {
    document.querySelector('#vez').innerHTML = 'Vez do ' + jogo.jogadorDeBrancas.username;
  }
  else {
    document.querySelector('#vez').innerHTML = 'Vez do ' + jogo.jogadorDePretas.username;
  }

  document.querySelector('.full-screen').classList.add('closed')
});

function limpaClasses() {
  const colunas = document.querySelectorAll('.coluna');

  colunas.forEach(coluna => {
    coluna.classList.remove('possivel-movimento', 'selecionado', 'nenhum-movimento')
  })
}

function createLoading() {
  const fullScreen = document.createElement('div');
  fullScreen.classList.add('full-screen');

  const spinner = document.createElement('div');
  spinner.classList.add('spinner-border', 'text-primary');
  spinner.role = 'status';

  const span = document.createElement('span');
  span.classList.add('sr-only');
  span.innerText = 'Carregando ...';

  spinner.appendChild(span);

  fullScreen.appendChild(spinner);

  const loadingText = document.createElement('div');
  loadingText.classList.add('loading-text');
  loadingText.innerHTML = 'Aguardando Adversário';

  fullScreen.appendChild(loadingText);

  return fullScreen;
}

document.querySelector('button').addEventListener('click', inseriNome)

function inseriNome() {
  const username = document.querySelector('input').value;

  document.querySelector('.container').innerHTML = '';
  document.querySelector('.container').appendChild(createLoading());

  socket.emit('entrou', username)
}

socket.on('possiveis-movimentos', ({ movimentos, tabuleiro, posicao }) => {
  limpaClasses()
  marcarCasasDePossiveisMovimentos(posicao, movimentos);
});

socket.on('movimentou', jogo => {
  if (jogo.jogadorDeBrancas.id === socket.id) {
    colocarPecasNoTabuleiro(jogo.tabuleiro);
  }
  else {
    colocarPecasNoTabuleiro(jogo.tabuleiro, true);
  }

  if (jogo.turno === 'branco') {
    document.querySelector('#vez').innerHTML = 'Vez do ' + jogo.jogadorDeBrancas.username;
  }
  else {
    document.querySelector('#vez').innerHTML = 'Vez do ' + jogo.jogadorDePretas.username;
  }
  limpaClasses()
});

socket.on('xequeMate', turno => {
  swal(`Xeque Mate Jogador de ${turno === 'branco' ? 'Pretas' : 'Brancas'} venceu`).then(() => {
    location.reload();
  })
});

socket.on('desconectou', jogador => {
  swal(`Jogador ${jogador} desconectou da partida`).then(() => {
    location.reload();
  })
})