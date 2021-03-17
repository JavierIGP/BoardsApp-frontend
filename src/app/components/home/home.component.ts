import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { BoardService } from '../../services/board.service';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Board } from '../../models/board';
import { Observable } from 'rxjs';

interface AppState {
  board: Board;
  cardsBlock: Record<string, string>;
  user: object;
  onlineUsers: Array<string>;
  socketState: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  selectFormControl1 = new FormControl(false);
  selectFormControl2 = new FormControl('', Validators.required);

  layouts;
  selectedLayout;
  blankBoard;
  user;
  userBoards;
  userStore: Observable<object>;

  constructor(private layoutService: LayoutService,
              private boardService: BoardService,
              private router: Router,
              private store: Store<AppState>) {
    this.userStore = store.select('user');

    this.userStore.subscribe(data => {
      this.user = JSON.parse(JSON.stringify(data));
    });
  }



  getLayouts(): void {
    this.layoutService.getLayouts()
      .subscribe(layouts =>  this.layouts = layouts);
  }

  getLayout(id): void {
    this.layoutService.getLayout(id)
      .subscribe(layout => this.selectedLayout = layout);
  }

  getUserBoards(email): void {
    this.boardService.getUserBoards(email)
      .subscribe(data => this.userBoards = data);
  }

  createBoard(data): void {
    this.boardService.createBoard(data)
      .subscribe(board => {
        this.blankBoard = board;
        this.navigate();
      });
  }

  navigate(): void {
    this.router.navigate(['/board/' + this.blankBoard.id]);
  }

  layoutSelected(event): void {
    this.getLayout(event.value);
  }

  navigateToBoard(event): void {
    this.router.navigate(['/board/' + event.value]);
  }

  newBoard(): void {
    const newBoard = {
      name: 'New Board',
      users: [this.user.email],
      layout: this.selectedLayout._id,
      currId: 100001,
      data: {
        cards: {},
        sections: {}
      }
    };
    for (const cat of this.selectedLayout.categories) {
      newBoard.data.sections[cat.id] = [];
    }
    this.createBoard(newBoard);
  }

  ngOnInit(): void {
    this.getLayouts();
    this.getUserBoards(this.user.email);
    if (!this.user.id) {
      this.router.navigate(['']);
    }
  }
}
