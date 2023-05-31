const socket = io();

function gerarTabuleiro() {
    const tabuleiro = document.querySelector('.chessboard');

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

        quadrado.addEventListener('click', selecionaCasa)

        tabuleiro.appendChild(quadrado);
    }

    document.body.appendChild(tabuleiro);
}

// Chamando a função para gerar o tabuleiro
gerarTabuleiro();


function colocarPecasNoTabuleiro() {
    const tabuleiro = document.getElementsByClassName('chessboard')[0];
    const quadrados = tabuleiro.getElementsByTagName('div');

    const pecas = [
        '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
        '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
        '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
    ];

    for (let i = 0; i < quadrados.length; i++) {
        quadrados[i].innerHTML = pecas[i];
    }
}

function selecionaCasa(){
    const posicao = this.id.split('-').map(v => Number(v));
    const peca = this.innerHTML;
    socket.emit('movimento', {posicao, peca});
}


colocarPecasNoTabuleiro();
