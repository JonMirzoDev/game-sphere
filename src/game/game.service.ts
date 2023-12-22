import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface Player {
  id: string;
  symbol: string;
}

interface GameSession {
  id: string;
  players: Player[];
  gameType: string;
  gameState: any;
}
@Injectable()
export class GameService {
  private gameSessions: Record<string, GameSession> = {};

  createSession(gameType: string): GameSession {
    const newSessionId = this.generateSessionId();
    return this.createGame(newSessionId, gameType);
  }

  private createGame(sessionId: string, gameType: string): GameSession {
    const newGame: GameSession = {
      id: sessionId,
      players: [],
      gameType: gameType,
      gameState: this.initializeGameState(gameType),
    };
    this.gameSessions[sessionId] = newGame;
    return newGame;
  }

  joinGame(sessionId: string, playerId: string): GameSession {
    const game = this.gameSessions[sessionId];
    console.log('joinGame: ', game);

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.length >= 2) {
      throw new Error('Game already full');
    }

    const isPlayerInGame = game.players.some(
      (player) => player.id === playerId,
    );
    if (isPlayerInGame) {
      return game;
    }

    const symbol = game.players.length === 0 ? 'R' : 'Y';
    game.players.push({ id: playerId, symbol });

    return game;
  }

  private initializeGameState(gameType: string): any {
    switch (gameType) {
      case 'tic-tac-toe':
        return this.initializeTicTacToe();
      case 'connect-four':
        return this.initializeConnectFour();
      default:
        throw new Error('Unknown game type');
    }
  }

  private initializeConnectFour(): any {
    return {
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
      currentPlayer: 'R',
      winner: null,
      draw: false,
    };
  }

  makeConnectFourMove(
    sessionId: string,
    playerId: string,
    column: number,
  ): any {
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

  private findAvailableRowInColumn(board: string[][], column: number): number {
    for (let row = 0; row < board.length; row++) {
      if (board[row][column] === null) {
        return row;
      }
    }
    return -1;
  }

  private checkConnectFourWinner(board: string[][]): string | null {
    // horizontal lines
    for (let row = 0; row < board[0].length; row++) {
      for (let col = 0; col < board.length - 3; col++) {
        if (
          board[col][row] &&
          board[col][row] === board[col + 1][row] &&
          board[col][row] === board[col + 2][row] &&
          board[col][row] === board[col + 3][row]
        ) {
          return board[col][row];
        }
      }
    }

    // vertical lines
    for (let col = 0; col < board.length; col++) {
      for (let row = 0; row < board[col].length - 3; row++) {
        if (
          board[col][row] &&
          board[col][row] === board[col][row + 1] &&
          board[col][row] === board[col][row + 2] &&
          board[col][row] === board[col][row + 3]
        ) {
          return board[col][row];
        }
      }
    }

    // diagonal (bottom-left to top-right)
    for (let col = 0; col < board.length - 3; col++) {
      for (let row = 3; row < board[col].length; row++) {
        if (
          board[col][row] &&
          board[col][row] === board[col + 1][row - 1] &&
          board[col][row] === board[col + 2][row - 2] &&
          board[col][row] === board[col + 3][row - 3]
        ) {
          return board[col][row];
        }
      }
    }

    // diagonal (top-left to bottom-right)
    for (let col = 0; col < board.length - 3; col++) {
      for (let row = 0; row < board[col].length - 3; row++) {
        if (
          board[col][row] &&
          board[col][row] === board[col + 1][row + 1] &&
          board[col][row] === board[col + 2][row + 2] &&
          board[col][row] === board[col + 3][row + 3]
        ) {
          return board[col][row];
        }
      }
    }

    return null;
  }

  private checkConnectFourDraw(board: string[][]): boolean {
    if (this.checkConnectFourWinner(board)) {
      return false;
    }

    return board.every((column) => column.every((cell) => cell !== null));
  }

  private getPlayerSymbol(game: GameSession, playerId: string): string {
    const player = game.players.find((p) => p.id === playerId);
    return player ? player.symbol : '';
  }

  private initializeTicTacToe(): any {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      draw: false,
    };
  }

  makeTicTacToeMove(
    sessionId: string,
    playerId: string,
    position: number,
    playerSymbol: string,
  ): any {
    const game = this.gameSessions[sessionId];
    console.log('makeTicTacToeMove: ', game);
    if (!game || game.gameType !== 'tic-tac-toe') {
      throw new Error('Invalid game session');
    }

    if (
      game.gameState.currentPlayer !== playerSymbol ||
      game.gameState.board[position] !== null
    ) {
      throw new Error('Invalid move');
    }

    game.gameState.board[position] = playerSymbol;

    const winner = this.checkTicTacToeWinner(game.gameState.board);
    if (winner) {
      game.gameState.winner = winner;
    } else {
      if (this.isDraw(game.gameState.board)) {
        game.gameState.draw = true;
      } else {
        game.gameState.currentPlayer =
          game.gameState.currentPlayer === 'X' ? 'O' : 'X';
      }
    }

    return game.gameState;
  }

  private checkTicTacToeWinner(board: string[]): string | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  getGameSession(sessionId: string): GameSession | undefined {
    return this.gameSessions[sessionId];
  }

  private isDraw(board: string[]): boolean {
    return board.every((position) => position !== null);
  }

  private generateSessionId(): string {
    return uuidv4();
  }

  getAvailableGameSessions(gameType: string): GameSession[] {
    return Object.values(this.gameSessions).filter(
      (session) => session.players.length < 2 && session.gameType === gameType,
    );
  }
}
