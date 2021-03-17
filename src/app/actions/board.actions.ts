import { Action } from '@ngrx/store';

export const LOAD_BOARD = '[Board] Load Board';
export const NEW_CARD = '[Board] New Card';
export const MOVE_CARD = '[Board] Move Card';
export const DELETE_CARD = '[Board] Delete Card';
export const NAME = '[Board] Board Name';
export const UPDATE_CARD = '[Board] Update card field';
export const LOCK = '[Cards] Lock Card';
export const UNLOCK = '[Cards] Unlock Card';
export const USER_REGISTER = '[User] Register';
export const ADD_USER = '[Board] Add User';
export const USER_ONLINE = '[Users] User Online';
export const USER_OFFLINE = '[Users] User Offline';
export const SOCKET_CLOSE = '[Socket] Closed';
export const SOCKET_OPEN = '[Socket] Opened';

export class BoardName implements Action {
    readonly type = NAME;
    constructor(public payload: object) {}
}

export class UserOnline implements Action {
    readonly type = USER_ONLINE;
    constructor(public payload: object) {}
}

export class UserOffline implements Action {
    readonly type = USER_OFFLINE;
    constructor(public payload: object) {}
}

export class LoadBoard implements Action {
    readonly type = LOAD_BOARD;
    constructor(public payload: object) {}
}

export class NewCard implements Action {
    readonly type = NEW_CARD;
    constructor(public payload: object) {}
}

export class MoveCard implements Action {
    readonly type = MOVE_CARD;
    constructor(public payload: object) {}
}

export class DeleteCard implements Action {
    readonly type = DELETE_CARD;
    constructor(public payload: object) {}
}

export class UpdateCard implements Action {
    readonly type = UPDATE_CARD;
    constructor(public payload: object) {}
}

export class LockCard implements Action {
    readonly type = LOCK;
    constructor(public payload: object) {}
}

export class UnlockCard implements Action {
    readonly type = UNLOCK;
    constructor(public payload: object) {}
}

export class UserRegister implements Action {
    readonly type = USER_REGISTER;
    constructor(public payload: object) {}
}

export class AddUser implements Action {
    readonly type = ADD_USER;
    constructor(public payload: object ) {}
}

export class SocketClose implements Action {
    readonly type = SOCKET_CLOSE;
    constructor(public payload: object) {}
}

export class SocketOpen implements Action {
    readonly type = SOCKET_OPEN;
    constructor(public payload: object) {}
}

export type All = LoadBoard | NewCard | MoveCard | DeleteCard | BoardName | UpdateCard | LockCard | UnlockCard | UserRegister | AddUser | UserOnline | UserOffline | SocketClose | SocketOpen;
