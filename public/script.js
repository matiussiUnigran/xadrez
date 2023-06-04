const socket = io();

const pecas = {
  '♙': `<iconify-icon icon="fa6-solid:chess-pawn" style="color: white"></iconify-icon>`,
  '♟': `<iconify-icon icon="fa6-solid:chess-pawn"></iconify-icon>`,
  '♜': `<iconify-icon icon="fa6-solid:chess-rook"></iconify-icon>`,
  '♖': `<iconify-icon icon="fa6-solid:chess-rook" style="color: white"></iconify-icon>`,
  '♞': `<iconify-icon icon="fa6-solid:chess-knight"></iconify-icon>`,
  '♘': `<iconify-icon icon="fa6-solid:chess-knight" style="color: white"></iconify-icon>`,
  '♝': `<iconify-icon icon="fa6-solid:chess-bishop"></iconify-icon>`,
  '♗': `<iconify-icon icon="fa6-solid:chess-bishop" style="color: white"></iconify-icon>`,
  '♛': `<iconify-icon icon="fa6-solid:chess-queen"></iconify-icon>`,
  '♕': `<iconify-icon icon="fa6-solid:chess-queen" style="color: white"></iconify-icon>`,
  '♚': `<iconify-icon icon="fa6-solid:chess-king"></iconify-icon>`,
  '♔': `<iconify-icon icon="fa6-solid:chess-king" style="color: white"></iconify-icon>`,
  '':''
};

function gerarTabuleiro() {
  const tabuleiro = document.querySelector('.chessboard');
  tabuleiro.innerHTML = '';
  const linhas = 8;
  const colunas = 8;
  const tamanhoQuadrado = 50;

  for (let i = 0; i < linhas; i++) {
    const linhaDiv = document.createElement('div');
    linhaDiv.classList.add('linha')

    for (let j = 0; j < colunas; j++) {
      const quadrado = document.createElement('div');
      quadrado.classList.add('coluna')

      const cor = (i + j) % 2 === 0 ? 'white' : 'black';
      quadrado.classList.add(cor);

      quadrado.id = `${8 - i}-${j + 1}`;

      quadrado.addEventListener('click', selecionaCasa);

      linhaDiv.appendChild(quadrado);
    }

    tabuleiro.appendChild(linhaDiv);
  }

  document.body.appendChild(tabuleiro);
}

function colocarPecasNoTabuleiro(tabuleiro) {
  const quadrados = document.querySelectorAll('.chessboard div div');

  for (let i = 0; i < quadrados.length; i++) {
    if (quadrados[i].innerHTML !== pecas[tabuleiro[i]]){
      quadrados[i].innerHTML = pecas[tabuleiro[i]];
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
  if (jogo.jogadorDeBrancas.id === socket.id) {
    if (jogo.turno === 'branco') {
      document.querySelector('#vez').innerHTML = 'SUA VEZ'
    }
    else {
      document.querySelector('#vez').innerHTML = 'VEZ DO ADVERSÁRIO'
    }
  }
  else {
    if (jogo.turno === 'preto') {
      document.querySelector('#vez').innerHTML = 'SUA VEZ'
    }
    else {
      document.querySelector('#vez').innerHTML = 'VEZ DO ADVERSÁRIO'
    }
  }
  document.querySelector('.full-screen').classList.add('closed')
  gerarTabuleiro();
  colocarPecasNoTabuleiro(jogo.tabuleiro);
});

function limpaClasses(){
  const colunas = document.querySelectorAll('.coluna');

  colunas.forEach(coluna => {
    coluna.classList.remove('possivel-movimento','selecionado','nenhum-movimento')
  })
}

socket.on('possiveis-movimentos', ({ movimentos, tabuleiro, posicao }) => {
  colocarPecasNoTabuleiro(tabuleiro);
  limpaClasses()
  marcarCasasDePossiveisMovimentos(posicao, movimentos);
});

socket.on('movimentou', jogo => {
  if (jogo.jogadorDeBrancas.id === socket.id) {
    if (jogo.turno === 'branco') {
      document.querySelector('#vez').innerHTML = 'SUA VEZ'
    }
    else {
      document.querySelector('#vez').innerHTML = 'VEZ DO ADVERSÁRIO'
    }
  }
  else {
    if (jogo.turno === 'preto') {
      document.querySelector('#vez').innerHTML = 'SUA VEZ'
    }
    else {
      document.querySelector('#vez').innerHTML = 'VEZ DO ADVERSÁRIO'
    }
  }
  limpaClasses()
  colocarPecasNoTabuleiro(jogo.tabuleiro);
});

socket.on('xequeMate', turno => {
  swal(`Xeque Mate Jogador de ${turno==='branco' ? 'Pretas' : 'Brancas'} venceu`).then(()=>{
    location.reload();
  })
})