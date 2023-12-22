"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let GameService = class GameService {
    constructor() {
        this.gameSessions = {};
    }
    createSession(gameType) {
        const newSessionId = this.generateSessionId();
        return this.createGame(newSessionId, gameType);
    }
    createGame(sessionId, gameType) {
        const newGame = {
            id: sessionId,
            players: [],
            gameType: gameType,
            gameState: this.initializeGameState(gameType),
        };
        this.gameSessions[sessionId] = newGame;
        return newGame;
    }
    joinGame(sessionId, playerId) {
        const game = this.gameSessions[sessionId];
        console.log('joinGame: ', game);
        if (!game) {
            throw new Error('Game not found');
        }
        if (game.players.length >= 2) {
            throw new Error('Game already full');
        }
        const isPlayerInGame = game.players.some((player) => player.id === playerId);
        if (isPlayerInGame) {
            return game;
        }
        const symbol = game.players.length === 0 ? 'R' : 'Y';
        game.players.push({ id: playerId, symbol });
        return game;
    }
    initializeGameState(gameType) {
        switch (gameType) {
            case 'tic-tac-toe':
                return this.initializeTicTacToe();
            case 'connect-four':
                return this.initializeConnectFour();
            default:
                throw new Error('Unknown game type');
        }
    }
    initializeConnectFour() {
        return {
            board: Array(6)
                .fill(null)
                .map(() => Array(7).fill(null)),
            currentPlayer: 'R',
            winner: null,
            draw: false,
        };
    }
    makeConnectFourMove(sessionId, playerId, column) {
        const game = this.gameSessions[sessionId];
        if (!game || game.gameType !== 'connect-four') {
            throw new Error('Invalid game session');
        }
        const { board, currentPlayer } = game.gameState;
        if (currentPlayer !== this.getPlayerSymbol(game, playerId)) {
            throw new Error("Not player's turn");
        }
        const row = this.findAvailableRowInColumn(board, column);
        if (row === -1) {
            throw new Error('Column is full');
        }
        board[row][column] = currentPlayer;
        const winner = this.checkConnectFourWinner(board);
        const isDraw = this.checkConnectFourDraw(board);
        game.gameState.currentPlayer = currentPlayer === 'R' ? 'Y' : 'R';
        if (winner) {
            game.gameState.winner = winner;
        }
        if (isDraw) {
            game.gameState.draw = true;
        }
        return game.gameState;
    }
    findAvailableRowInColumn(board, column) {
        for (let row = 0; row < board.length; row++) {
            if (board[row][column] === null) {
                return row;
            }
        }
        return -1;
    }
    checkConnectFourWinner(board) {
        for (let row = 0; row < board[0].length; row++) {
            for (let col = 0; col < board.length - 3; col++) {
                if (board[col][row] &&
                    board[col][row] === board[col + 1][row] &&
                    board[col][row] === board[col + 2][row] &&
                    board[col][row] === board[col + 3][row]) {
                    return board[col][row];
                }
            }
        }
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < board[col].length - 3; row++) {
                if (board[col][row] &&
                    board[col][row] === board[col][row + 1] &&
                    board[col][row] === board[col][row + 2] &&
                    board[col][row] === board[col][row + 3]) {
                    return board[col][row];
                }
            }
        }
        for (let col = 0; col < board.length - 3; col++) {
            for (let row = 3; row < board[col].length; row++) {
                if (board[col][row] &&
                    board[col][row] === board[col + 1][row - 1] &&
                    board[col][row] === board[col + 2][row - 2] &&
                    board[col][row] === board[col + 3][row - 3]) {
                    return board[col][row];
                }
            }
        }
        for (let col = 0; col < board.length - 3; col++) {
            for (let row = 0; row < board[col].length - 3; row++) {
                if (board[col][row] &&
                    board[col][row] === board[col + 1][row + 1] &&
                    board[col][row] === board[col + 2][row + 2] &&
                    board[col][row] === board[col + 3][row + 3]) {
                    return board[col][row];
                }
            }
        }
        return null;
    }
    checkConnectFourDraw(board) {
        if (this.checkConnectFourWinner(board)) {
            return false;
        }
        return board.every((column) => column.every((cell) => cell !== null));
    }
    getPlayerSymbol(game, playerId) {
        const player = game.players.find((p) => p.id === playerId);
        return player ? player.symbol : '';
    }
    initializeTicTacToe() {
        return {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            draw: false,
        };
    }
    makeTicTacToeMove(sessionId, playerId, position, playerSymbol) {
        const game = this.gameSessions[sessionId];
        console.log('makeTicTacToeMove: ', game);
        if (!game || game.gameType !== 'tic-tac-toe') {
            throw new Error('Invalid game session');
        }
        if (game.gameState.currentPlayer !== playerSymbol ||
            game.gameState.board[position] !== null) {
            throw new Error('Invalid move');
        }
        game.gameState.board[position] = playerSymbol;
        const winner = this.checkTicTacToeWinner(game.gameState.board);
        if (winner) {
            game.gameState.winner = winner;
        }
        else {
            if (this.isDraw(game.gameState.board)) {
                game.gameState.draw = true;
            }
            else {
                game.gameState.currentPlayer =
                    game.gameState.currentPlayer === 'X' ? 'O' : 'X';
            }
        }
        return game.gameState;
    }
    checkTicTacToeWinner(board) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    getGameSession(sessionId) {
        return this.gameSessions[sessionId];
    }
    isDraw(board) {
        return board.every((position) => position !== null);
    }
    generateSessionId() {
        return (0, uuid_1.v4)();
    }
    getAvailableGameSessions(gameType) {
        return Object.values(this.gameSessions).filter((session) => session.players.length < 2 && session.gameType === gameType);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map