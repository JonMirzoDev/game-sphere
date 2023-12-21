import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private gameService: GameService) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.broadcastSessionUpdates();
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('requestSessions')
  async handleRequestSessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { gameType: string },
  ): Promise<void> {
    try {
      let sessions = this.gameService.getAvailableGameSessions(
        payload.gameType,
      );

      if (!sessions.length) {
        const newSession = this.gameService.createSession(payload.gameType);
        sessions = [newSession];
      }

      client.emit('availableGames', sessions);
    } catch (error) {
      client.emit('exception', { message: error.message });
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; playerId: string },
  ): Promise<void> {
    try {
      const game = this.gameService.joinGame(
        payload.sessionId,
        payload.playerId,
      );
      client.join(payload.sessionId);
      this.broadcastSessionUpdates();
      client.emit('joinGameResponse', {
        status: 'success',
        game, // Include the game data in the response
      });
    } catch (error) {
      client.emit('joinGameResponse', {
        status: 'error',
        message: error.message,
      });
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      sessionId: string;
      playerId: string;
      position: number;
      playerSymbol: string;
    },
  ): Promise<void> {
    try {
      const updatedGameState = this.gameService.makeTicTacToeMove(
        payload.sessionId,
        payload.playerId,
        payload.position,
        payload.playerSymbol,
      );
      this.server.to(payload.sessionId).emit('gameState', updatedGameState);
    } catch (error) {
      client.emit('exception', { message: error.message });
    }
  }

  private broadcastSessionUpdates() {
    const availableSessions =
      this.gameService.getAvailableGameSessions('tic-tac-toe');
    this.server.emit('availableGames', availableSessions);
  }
}
