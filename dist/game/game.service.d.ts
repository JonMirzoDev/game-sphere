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
export declare class GameService {
    private gameSessions;
    createSession(gameType: string): GameSession;
    private createGame;
    joinGame(sessionId: string, playerId: string): GameSession;
    private initializeGameState;
    private initializeConnectFour;
    makeConnectFourMove(sessionId: string, playerId: string, column: number): any;
    private findAvailableRowInColumn;
    private checkConnectFourWinner;
    private checkConnectFourDraw;
    private getPlayerSymbol;
    private initializeTicTacToe;
    makeTicTacToeMove(sessionId: string, playerId: string, position: number, playerSymbol: string): any;
    private checkTicTacToeWinner;
    getGameSession(sessionId: string): GameSession | undefined;
    private isDraw;
    private generateSessionId;
    getAvailableGameSessions(gameType: string): GameSession[];
}
export {};
