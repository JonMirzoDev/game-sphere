import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
interface GameSession {
  id: string;
  players: string[];
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
    if (game && game.players.length < 2) {
      game.players.push(playerId);
      return game;
    }
    throw new Error('Game not found or already full');
  }

  private initializeGameState(gameType: string): any {
    switch (gameType) {
      case 'tic-tac-toe':
        return this.initializeTicTacToe();
      default:
        throw new Error('Unknown game type');
    }
  }

  private initializeTicTacToe(): any {
    return {
      board: Array(9).fill(null), // 3x3 board
      currentPlayer: 'X', // Player X starts
      winner: null,
      draw: false,
    };
  }

  makeTicTacToeMove(
    sessionId: string,
    playerId: string,
    position: number,
  ): any {
    const game = this.gameSessions[sessionId];
    if (!game || game.gameType !== 'tic-tac-toe') {
      throw new Error('Invalid game session');
    }

    if (
      game.gameState.currentPlayer !== playerId ||
      game.gameState.board[position] !== null
    ) {
      throw new Error('Invalid move');
    }

    game.gameState.board[position] = playerId;

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
