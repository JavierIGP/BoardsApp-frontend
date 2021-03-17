/*  
    Copyright (C) 2020 Javier Gómez

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
    
*/

/* tslint:disable:no-string-literal */
import * as BoardActions from '../actions/board.actions';
import { Board } from '../models/board';

export type Action = BoardActions.All;


const defaultState: Board = {
    name: '',
    wsId: '',
    users: [],
    layout: '',
    data: {
        cards: {'': {}},
        sections: {'': []}
    },
};

const defaultCardsBlockState: Record<string, string> = {
    '': ''
};

const defaultUserState: object = {

};

const defaultOnlineUsersState: Array<string> = [];

const defaultSocketState: boolean = true;

const defaultUserColorsState: Array<object> = [];


const newState = (state, newData) => {
    return Object.assign({}, state, newData);
};

export function socketStateReducer(state: boolean = defaultSocketState, action: Action): boolean {
    switch(action.type) {
        case BoardActions.SOCKET_OPEN:
            return true;
        case BoardActions.SOCKET_CLOSE:
            return false;
        default:
            return state;
    }
}

export function userColorsReducer(state: Array<object> = defaultUserColorsState, action: Action): Array<object> {
    switch(action.type) {
        case BoardActions.USER_ONLINE:
            return action.payload['userColors'];
        case BoardActions.USER_OFFLINE:
            return action.payload['userColors'];
        default:
            return state;
    }
}

export function onlineUsersReducer(state: Array<string> = defaultOnlineUsersState, action: Action): object {
    switch (action.type) {
        case BoardActions.LOAD_BOARD:
            return [
                ...state,
                ...action.payload['onlineUsers'],
            ];
        case BoardActions.USER_ONLINE:
            return [
                ...state,
                action.payload['email'],
            ];
        case BoardActions.USER_OFFLINE:
            const userIndex = state.findIndex(el => el == action.payload['email']);
            return [
                ...state.slice(0, userIndex),
                ...state.slice(userIndex + 1),
            ];
        default:
            return state;
    }
}

export function userReducer(state: object = defaultUserState, action: Action): object {
    switch (action.type) {
        case BoardActions.USER_REGISTER:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

export function cardsBlockReducer(state: Record<string, string> = defaultCardsBlockState, action: Action): Record<string, string> {
    switch (action.type) {
        case BoardActions.LOCK:
            return Object.assign({}, state, {
                [action.payload['cardId']]: action.payload['email']
            });
        case BoardActions.UNLOCK:
            return Object.assign({}, state, {
                [action.payload['cardId']['cardId']]: undefined
            });
        case BoardActions.LOAD_BOARD:
            return Object.assign({}, state, action.payload['cardsLock']);
        default:
            return state;
    }
}

export function boardReducer(state: Board = defaultState, action: Action): Board {
    console.log(action.type);
    let uuid;

    switch (action.type) {

        case BoardActions.LOAD_BOARD:
            const newBoard = Object.assign({}, action.payload['board'], {
                wsId: action.payload['wsId']
            });
            return newState(state, newBoard);

        case BoardActions.NEW_CARD:
            const sectionNewCard = action.payload['section'];
            const newCard = action.payload['card'];
            uuid = action.payload['card']['id'];
            return Object.assign({}, state, {
                data: {
                    cards: Object.assign({}, state.data['cards'], {
                        [uuid]: {
                            text: newCard['text'],
                            description: newCard['description']
                        }
                    }),
                    sections: Object.assign({}, state.data['sections'], {
                        [sectionNewCard]: [...state.data['sections'][sectionNewCard], uuid]
                    })
                }
            });

        case BoardActions.DELETE_CARD:
            const sectionDelete = action.payload['section'];
            const cardId = action.payload['id'];

            const deleteIndex = state.data['sections'][sectionDelete].findIndex( el => el === cardId );

            const cardsCopy = Object.assign({}, state.data['cards']);
            delete cardsCopy[cardId];

            return Object.assign({}, state, {
                data: {
                    cards: cardsCopy,
                    sections: Object.assign({}, state.data['sections'], {
                        [sectionDelete]: [
                            ...state.data['sections'][sectionDelete].slice(0, deleteIndex),
                            ...state.data['sections'][sectionDelete].slice(deleteIndex + 1)
                        ]
                    })
                }
            });

        case BoardActions.NAME:
            return Object.assign({}, state, {
                name: action.payload['value'],
            });

        case BoardActions.MOVE_CARD:
            const sourceSection = action.payload['sourceSection'];
            const targetSection = action.payload['targetSection'];
            const sourceIndex = action.payload['sourceIndex'];
            const targetIndex = action.payload['targetIndex'];
            const cardUuid = state.data['sections'][sourceSection][sourceIndex];
            if (sourceSection !== targetSection){
                return Object.assign({}, state, {
                    data: {
                        cards: state.data['cards'],
                        sections: Object.assign({}, state.data['sections'], {
                            [sourceSection]: [
                                ...state.data['sections'][sourceSection].slice(0, sourceIndex),
                                ...state.data['sections'][sourceSection].slice(sourceIndex + 1)
                            ],
                            [targetSection]: [
                                ...state.data['sections'][targetSection].slice(0, targetIndex),
                                cardUuid,
                                ...state.data['sections'][targetSection].slice(targetIndex)
                            ]
                        })
                    }
                });
            }
            else {
                if (sourceIndex > targetIndex) {
                    return Object.assign({}, state, {
                        data: {
                            cards: state.data['cards'],
                            sections: Object.assign({}, state.data['sections'], {
                                [targetSection]: [
                                    ...state.data['sections'][targetSection].slice(0, targetIndex),
                                    cardUuid,
                                    ...state.data['sections'][targetSection].slice(targetIndex, sourceIndex),
                                    ...state.data['sections'][targetSection].slice(sourceIndex + 1)
                                ]
                            })
                        }
                    });
                }
                else {
                    return Object.assign({}, state, {
                        data: {
                            cards: state.data['cards'],
                            sections: Object.assign({}, state.data['sections'], {
                                [targetSection]: [
                                    ...state.data['sections'][targetSection].slice(0, sourceIndex),
                                    ...state.data['sections'][targetSection].slice(sourceIndex + 1, targetIndex + 1),
                                    cardUuid,
                                    ...state.data['sections'][targetSection].slice(targetIndex + 1)
                                ]
                            })
                        }
                    });
                }
            }
        case BoardActions.UPDATE_CARD:
            return Object.assign({}, state, {
                data: {
                    cards: Object.assign({}, state.data['cards'], {
                        [action.payload['cardId']]: Object.assign({}, state.data['cards'][action.payload['cardId']], {
                            [action.payload['field']]: action.payload['data']
                        })
                    }),
                    sections: state.data['sections']
                }
            });
        case BoardActions.ADD_USER:
            return Object.assign({}, state, {
                users: [
                    ...state.users,
                    action.payload['email']
                ],
            });
        default:
            return state;
    }
}



