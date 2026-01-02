import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: 'games',
    cors: {
        origin: '*',
    },
})
@Injectable()
export class GamesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        console.log('Games Gateway Initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Client connected to games namespace: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected from games namespace: ${client.id}`);
    }

    @SubscribeMessage('join_game')
    handleJoinGame(client: Socket, payload: { gameId: string | number }) {
        const roomName = `game_${payload.gameId}`;
        client.join(roomName);
        console.log(`Client ${client.id} joined room ${roomName}`);
        return { event: 'joined_room', data: roomName };
    }

    @SubscribeMessage('leave_game')
    handleLeaveGame(client: Socket, payload: { gameId: string | number }) {
        const roomName = `game_${payload.gameId}`;
        client.leave(roomName);
        console.log(`Client ${client.id} left room ${roomName}`);
        return { event: 'left_room', data: roomName };
    }

    @SubscribeMessage('client_update')
    handleClientUpdate(client: Socket, payload: any) {
        // Relay to room
        // payload should have id (gameId)
        if (payload.id) {
            this.server.to(`game_${payload.id}`).emit('game_update', payload);
        }
    }

    // Method to broadcast updates to a specific game room
    sendGameUpdate(gameId: number, data: any) {
        this.server.to(`game_${gameId}`).emit('game_update', data);
    }
}
