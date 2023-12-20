import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    // Handle new connection
  }

  handleDisconnect(client: Socket) {
    // Handle disconnection
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, payload: any): void {
    // Logic for joining a game
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, payload: any): void {
    // Logic for making a move
  }
}
