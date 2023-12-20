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
import { GameService } from './game.service'; // Import GameService

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private gameService: GameService) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.broadcastSessionUpdates(); // Broadcast sessions when a new client connects
  }

  handleDisconnect(client: Socket) {
    // Optionally handle disconnection
  }

  @SubscribeMessage('selectGameType')
  async handleSelectGameType(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { gameType: string; playerId: string },
  ): Promise<void> {
    try {
      const session = this.gameService.joinOrCreateSession(
        payload.gameType,
        payload.playerId,
      );
      client.join(session.id);
      this.broadcastSessionUpdates(); // Broadcast updated sessions after a new session is joined/created

      client.emit('selectGameTypeResponse', {
        status: 'success',
        sessionId: session.id,
      });
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
      this.gameService.joinGame(payload.sessionId, payload.playerId);
      client.join(payload.sessionId);
      this.broadcastSessionUpdates(); // Broadcast updated sessions after a player joins a game
    } catch (error) {
      client.emit('exception', { message: error.message });
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { sessionId: string; playerId: string; position: number },
  ): Promise<void> {
    try {
      const updatedGameState = this.gameService.makeTicTacToeMove(
        payload.sessionId,
        payload.playerId,
        payload.position,
      );
      this.server.to(payload.sessionId).emit('gameState', updatedGameState);
    } catch (error) {
      client.emit('exception', { message: error.message });
    }
  }

  // Helper method to broadcast current game sessions to all connected clients
  private broadcastSessionUpdates() {
    const availableSessions = this.gameService.getAvailableGameSessions();
    this.server.emit('availableGames', availableSessions);
  }

  // Additional methods for other game actions can be added here
}
