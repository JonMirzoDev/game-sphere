"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
let GameGateway = class GameGateway {
    constructor(gameService) {
        this.gameService = gameService;
    }
    handleConnection(client, ...args) {
        this.broadcastSessionUpdates();
    }
    handleDisconnect(client) { }
    async handleRequestSessions(client, payload) {
        try {
            let sessions = this.gameService.getAvailableGameSessions(payload.gameType);
            if (!sessions.length) {
                const newSession = this.gameService.createSession(payload.gameType);
                sessions = [newSession];
            }
            client.emit('availableGames', sessions);
        }
        catch (error) {
            client.emit('exception', { message: error.message });
        }
    }
    async handleJoinGame(client, payload) {
        try {
            const game = this.gameService.joinGame(payload.sessionId, payload.playerId);
            client.join(payload.sessionId);
            this.broadcastSessionUpdates();
            client.emit('joinGameResponse', {
                status: 'success',
                game,
            });
        }
        catch (error) {
            client.emit('joinGameResponse', {
                status: 'error',
                message: error.message,
            });
        }
    }
    async handleMakeMove(client, payload) {
        try {
            const gameSession = this.gameService.getGameSession(payload.sessionId);
            if (!gameSession) {
                throw new Error('Game session not found');
            }
            let updatedGameState;
            switch (gameSession.gameType) {
                case 'tic-tac-toe':
                    updatedGameState = this.gameService.makeTicTacToeMove(payload.sessionId, payload.playerId, payload.position, payload.playerSymbol);
                    break;
                case 'connect-four':
                    updatedGameState = this.gameService.makeConnectFourMove(payload.sessionId, payload.playerId, payload.position);
                    break;
                default:
                    throw new Error('Unsupported game type');
            }
            this.server.to(payload.sessionId).emit('gameState', updatedGameState);
        }
        catch (error) {
            client.emit('exception', { message: error.message });
        }
    }
    broadcastSessionUpdates() {
        const ticTacToeSessions = this.gameService.getAvailableGameSessions('tic-tac-toe');
        const connectFourSessions = this.gameService.getAvailableGameSessions('connect-four');
        const allSessions = [...ticTacToeSessions, ...connectFourSessions];
        this.server.emit('availableGames', allSessions);
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestSessions'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleRequestSessions", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('makeMove'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMakeMove", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map