const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let piece = '';

const pecasPretas = [
    '♜', '♞', '♝', '♛', '♚', '♟'
]

const pecasBrancas = [
    '♙', '♖', '♘', '♗', '♕', '♔'
]

let tabuleiro = [
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '♟', '', '', '', '', '', '',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
]

function calcIndex(linha, coluna){
    return (64 - ((linha * 8) - coluna) + 1)
}

function reset(){
    tabuleiro = [
        '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
        '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
        '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
    ]
}

function pecaBranca(peca){
    for(let i = 0 ; i < pecasBrancas ; i++){
        if (pecasBrancas[i] === peca){
            return true;
        }
    }

    return false;
}

function pecaPreta(peca){
    for(let i = 0 ; i < pecasPretas.length ; i++){
        if (pecasPretas[i] === peca){
            return true;
        }
    }

    return false;
}

class Peao{
    movimento(){
        if('♙'){

        }
        else{

        }
    }

    static possiveisMovimentos({ posicao }){
        const [linha, coluna] = posicao;
        const movimentos = [];
        if('♙'){
            if(linha === 2){
                for (let i = 1 ; i <= 2 ; i++){
                    if (tabuleiro[calcIndex(linha + i, coluna)] === ''){
                        movimentos.push([linha + i,coluna])
                    }
                    else{
                        break;
                    }
                }
                if (pecaPreta(tabuleiro[calcIndex(linha + 1, coluna + 1)])) movimentos.push([linha + 1, coluna + 1]);
                if (pecaPreta(tabuleiro[calcIndex(linha + 1, coluna - 1)])) movimentos.push([linha + 1, coluna - 1]);
            }
            else{

            }
        }
        else{
            
        }

        return movimentos;
    }
}

class Torre{
    movimento(){

    }

    possiveisMovimentos(){
        
    }
}

class Cavalo{
    movimento(){

    }

    possiveisMovimentos(){
        
    }
}

class Bispo{
    movimento(){

    }

    possiveisMovimentos(){
        
    }
}

class Rainha{
    movimento(){

    }

    possiveisMovimentos(){
        
    }
}

class Rei{
    movimento(){

    }

    possiveisMovimentos(){
        
    }
}

function move({ posicao,  peca}){
    
}

io.on('connection', (socket) => {
    socket.on('movimento', (msg) => {
        console.log(Peao.possiveisMovimentos(msg))
    })
});

app
.use(express.static(path.join(__dirname, 'public')))
.use(express.urlencoded({extended: true}))
.get('/', (req, res) => {
    return res.sendFile('index.html', {root: __dirname})
})
server.listen(8000);