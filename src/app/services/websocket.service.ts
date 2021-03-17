import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Board } from '../models/board';
import * as BoardActions from '../actions/board.actions';

interface AppState {
  board: Board;
  cardsBlock: Record<string, string>;
  user: object;
}


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  webSocket: WebSocket;

  constructor(private store: Store<AppState>) { }

  public open(boardId): void {
    this.webSocket = new WebSocket('ws://localhost:3000/ws/' + boardId);

    this.webSocket.onopen = () => {
      console.log('[SOCKET] Open event');
      this.store.dispatch(new BoardActions.SocketOpen({}));
    };

    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'heartbeat') {
        return this.send({
          type: 'heartbeat',
          kind: 'pong',
        });
      }

      switch (message.type) {
        case 'LOAD_BOARD':
          this.store.dispatch(new BoardActions.LoadBoard(message));
          break;
        case 'MOVE':
          this.store.dispatch(new BoardActions.MoveCard(message));
          break;
        case 'CREATE':
          this.store.dispatch(new BoardActions.NewCard(message));
          break;
        case 'DELETE':
          this.store.dispatch(new BoardActions.DeleteCard(message));
          break;
        case 'UPDATE_CARD':
          this.store.dispatch(new BoardActions.UpdateCard(message));
          break;
        case 'NAME':
          this.store.dispatch(new BoardActions.BoardName(message));
          break;
        case 'LOCK':
          this.store.dispatch(new BoardActions.LockCard(message));
          break;
        case 'UNLOCK':
          this.store.dispatch(new BoardActions.UnlockCard(message));
          break;
        case 'ADD_USER':
          this.store.dispatch(new BoardActions.AddUser(message));
          break;
        case 'USER_ONLINE':
          this.store.dispatch(new BoardActions.UserOnline(message));
          break;
        case 'USER_OFFLINE':
          this.store.dispatch(new BoardActions.UserOffline(message));
          break;
        default:
          console.log('Tried to dispatch invalid action');
      }
    };

    this.webSocket.onclose = () => {
      this.store.dispatch(new BoardActions.SocketClose({}));
      console.log('[SOCKET] Close event');
    };
  }

  public send(message): void {
    if (this.webSocket){
      this.webSocket.send(JSON.stringify(message));
    }
    else {
      console.log('WebSocket is not open.');
    }
  }

  public close(): void {
    this.webSocket.close();
    console.log('WebSocket closed.');
  }
}
