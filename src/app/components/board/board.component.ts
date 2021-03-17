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

import { Component, OnInit, Inject, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';
import { WebsocketService } from '../../services/websocket.service';
import { DragulaService } from 'ng2-dragula';
import { faTimes, faPlusCircle, faEdit, faUserPlus, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';


import { Board } from '../../models/board';
import { FormControl, Validators } from '@angular/forms';
import { BoardService } from 'src/app/services/board.service';

interface AppState {
  board: Board;
  cardsBlock: Record<string, string>;
  user: object;
  onlineUsers: Array<string>;
  socketState: boolean;
  userColors: Array<object>;
}


export interface DialogData {
  category: string;
  text: string;
  description: string;
  cardId: string;
  label: string;
  unlock: boolean;
  wsId: string;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  providers: [DragulaService]
})
export class BoardComponent implements OnInit, OnDestroy {

  boardStore: Observable<Board>;
  id: string;
  board;
  layout;
  faTimes = faTimes;
  faPlusCircle = faPlusCircle;
  faEdit = faEdit;
  faUserPlus = faUserPlus;
  faUser = faUser;
  faPlus = faPlus;
  inputFlag = {};
  cardsBlock = {};
  cardsBlockStore: Observable<Record<string, string>>;
  userStore: Observable<object>;
  user;
  onlineUsersStore: Observable<Array<string>>;
  onlineUsers;
  socketStateStore: Observable<boolean>;
  socketState = true;
  loaded = false;
  subs = new Subscription();
  email = new FormControl('', [Validators.required, Validators.email]);
  userColorsStore: Observable<Array<object>>;
  userColors;

  constructor(private route: ActivatedRoute,
              private layoutService: LayoutService,
              private dragulaService: DragulaService,
              public dialog: MatDialog,
              private store: Store<AppState>,
              public webSocketService: WebsocketService,
              private router: Router) {

    this.boardStore = this.store.select('board');
    this.cardsBlockStore = this.store.select('cardsBlock');
    this.userStore = this.store.select('user');
    this.onlineUsersStore = this.store.select('onlineUsers');
    this.socketStateStore = this.store.select('socketState');
    this.userColorsStore = this.store.select('userColors');

    this.userStore.subscribe(data => {
      this.user = JSON.parse(JSON.stringify(data));
    });

    // needed to get board id from the url
    this.route.params
      .subscribe( params => {
        this.id = params.id;
        if (!this.user.email) {
          this.router.navigate(['']);
        }
        this.webSocketService.open(this.id);
        this.dragulaService.createGroup(params.id, {
          invalid: (el, handle) => el.classList.contains('locked')
        });
    });
    this.boardStore.subscribe(data => {
        this.board = JSON.parse(JSON.stringify(data));
    });

    this.cardsBlockStore.subscribe(data => {
        this.cardsBlock = JSON.parse(JSON.stringify(data));
    });

    this.onlineUsersStore.subscribe(data => {
      this.onlineUsers = JSON.parse(JSON.stringify(data));
    });

    this.socketStateStore.subscribe(data => {
      this.socketState = JSON.parse(JSON.stringify(data));
    });

    this.userColorsStore.subscribe(data => {
      this.userColors = JSON.parse(JSON.stringify(data));
    });

    // capture every drag event on board
    this.subs.add(
      this.dragulaService.dropModel()
      .subscribe(({ el, target, source, sourceIndex, targetIndex }) => {
        const payload = {
          type: 'MOVE',
          sourceSection: source.classList[1],
          sourceIndex,
          targetSection: target.classList[1],
          targetIndex,
        };
        this.webSocketService.send(payload);
      })
    );

    this.subs.add(
      this.dragulaService.drag(this.id)
      .subscribe(({ el }) => {
        this.lockCard(el.getAttribute('title'));
      })
    );

    this.subs.add(
      this.dragulaService.drop(this.id)
      .subscribe(({ el }) => {
        this.unlockCard({
          cardId: el.getAttribute('title')
        });
      })
    );

    this.subs.add(
      this.dragulaService.cancel(this.id)
      .subscribe(({ el }) => {
        this.unlockCard({
          cardId: el.getAttribute('title')
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.webSocketService.close();
  }
  async ngOnInit(): Promise<void> {
    await this.delay(500);
    this.webSocketService.send({
      type: 'LOAD_BOARD',
    });
    await this.delay(500);
    this.getLayoutData();
    for (const section of Object.keys(this.board.data.sections)){
      this.inputFlag[section] = false;
    }
    await this.delay(100);
    if ((this.board && this.layout && !this.board.layout) || !this.board.users.includes(this.user.email)) {
      this.router.navigate(['']);
    }
    this.loaded = true;
    console.log('loaded');
    this.webSocketService.send({
      type: 'USER_ONLINE',
      email: this.user.email,
      photoUrl: this.user.photoUrl,
    });
  }

  getUserColor = (email) => {
    var index = this.userColors.findIndex(el => el[0] === email);
    if (this.userColors[index] && this.userColors[index] !== 0) {
      return this.userColors[index][1]
    }
    else {
      return '';
    }
  }

  getUserImage = (email) => {
    var index = this.userColors.findIndex(el => el[0] === email);
    if (this.userColors[index] && this.userColors[index] !== 0) {
      return this.userColors[index][2]
    }
    else {
      return '';
    }
  }

  getErrorMessage(): string {
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  getLayoutData(layout?): void {
    if (layout){
      this.layoutService.getLayout(layout)
        .subscribe( data => this.layout = data);
    }
    else {
      this.layoutService.getLayout(this.board.layout)
        .subscribe( data => this.layout = data);
    }
  }
  delete(id, cardId): void {
    const i = this.board.data.sections[id].findIndex(x => x === cardId);
    this.board.data.sections[id].splice(i, 1);
    delete this.board.data.cards[cardId];
    const payload = {
      type: 'DELETE',
      section: id,
      id: cardId
    };
    this.webSocketService.send(payload);
  }

  activateInput(id, section): void {
    this.inputFlag[id] = true;
    this.focusElement('input-' + section);
  }

  async focusElement(id): Promise<void> {
    await this.delay(10);
    document.getElementById(id).focus();
  }

  updateBoardName(val): void {
    const payload = {
      type: 'NAME',
      value: val,
    };
    this.webSocketService.send(payload);
  }

  delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  addCard(id, content, form?): void {
    if (form){
      form.reset();
    }
    if (content !== ''){
      const uuid = UUID.UUID();

      const payload = {
        type: 'CREATE',
        section: id,
        card: {
          id: uuid,
          text: content,
          description: ''
        }
      };
      this.webSocketService.send(payload);
    }
  }

  lockCard(cardId): void {
    this.cardsBlock[cardId] = this.board.wsId;
    this.webSocketService.send({
      type: 'LOCK',
      cardId,
      email: this.user.email,
    });
  }

  unlockCard(cardId): void {
    delete this.cardsBlock[cardId];
    this.webSocketService.send({
      type: 'UNLOCK',
      cardId,
      email: this.user.email,
    });
  }

  openItemDialog(id, cardId, label): void {
    const unlock = this.cardsBlock[cardId] === undefined || this.cardsBlock[cardId] === this.board.wsId;
    const lock = this.cardsBlock[cardId];
    const card = this.board.data.cards[cardId];
    if (unlock) {
      this.lockCard(cardId);
    }
    const dialogRef = this.dialog.open(OpenCardDialogComponent, {
      height: '400px',
      width: '600px',
      data: {category: id, text: card.text, description: card.description, cardId, label,
        unlock,
        wsId: lock},
      autoFocus: false,
      disableClose: true
    });

    dialogRef.componentInstance.onSave.subscribe((data) => {
      this.updateCard(data.data.cardId, data.field, data.data[data.field]);
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.data.unlock) {
        this.unlockCard(result.data);
      }
      if (result){
        if (result.event === 'delete') {
          this.delete(result.data.id, result.data.cardId);
        }
      }
    });
  }

  updateCard(cardId, field, data): void {
    const payload = {
      type: 'UPDATE_CARD',
      cardId,
      field,
      data
    };
    this.webSocketService.send(payload);
  }

  addUser(form): void {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!this.email.hasError('email') && this.email.value !== '' && regex.test(this.email.value)) {
      const payload = {
        type: 'ADD_USER',
        email: this.email.value
      };
      this.webSocketService.send(payload);
      if (form){
        form.reset();
      }
    }
  }

  test(): void {
    console.log(this.cardsBlock);
  }

}

@Component({
  selector: 'app-open-card-dialog',
  templateUrl: 'open-card-dialog.html',
  styleUrls: ['./open-card-dialog.css'],
})
export class OpenCardDialogComponent {

  boardStore: Observable<Board>;
  board;

  constructor( public dialogRef: MatDialogRef<OpenCardDialogComponent>, 
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private store: Store<AppState>,) {
    this.boardStore = this.store.select('board');
    this.boardStore.subscribe(content => {
      this.board = JSON.parse(JSON.stringify(content));
    });
  }

  faTimes = faTimes;

  onSave = new EventEmitter();

  saveField(data, field): void {
    const newData = {
      cardId: data.cardId,
      text: this.board.data['cards'][data.cardId]['text'],
      description: this.board.data['cards'][data.cardId]['description'],
      
    };
    this.onSave.emit({
      data: newData,
      field
    });
  }

  onNoClick(data): void {
    this.dialogRef.close({data});
  }

  deleteCard(data): void{
    this.dialogRef.close({data: {id: data.category, cardId: data.cardId}, event: 'delete'});
  }

}
