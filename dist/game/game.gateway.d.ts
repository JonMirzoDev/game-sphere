import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private gameService;
    server: Server;
    constructor(gameService: GameService);
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handleRequestSessions(client: Socket, payload: {
        gameType: string;
    }): Promise<void>;
    handleJoinGame(client: Socket, payload: {
        sessionId: string;
        playerId: string;
    }): Promise<void>;
    handleMakeMove(client: Socket, payload: {
        sessionId: string;
        playerId: string;
        position: number;
        playerSymbol: string;
    }): Promise<void>;
    private broadcastSessionUpdates;
}
