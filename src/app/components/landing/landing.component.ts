import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { LayoutService } from '../../services/layout.service';
import { BoardService } from '../../services/board.service';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import { Board } from '../../models/board';
import * as BoardActions from '../../actions/board.actions';


interface AppState {
  board: Board;
  cardsBlock: Record<string, string>;
  user: object;
  onlineUsers: Array<string>;
  socketState: boolean;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  user: SocialUser;
  loggedIn: boolean;
  timeout = false;
  faGoogle = faGoogle;

  selectFormControl1 = new FormControl(false);
  selectFormControl2 = new FormControl('', Validators.required);

  layouts;
  selectedLayout;
  blankBoard;
  userBoards;

  constructor(private authService: SocialAuthService,
              private store: Store<AppState>,
              private router: Router,
              private layoutService: LayoutService,
              private boardService: BoardService,) { }

  signInWithGoogle(): void {
    setTimeout(() => { this.timeout = true; }, 3000);
    const googleLoginOptions = {
      scope: 'profile email'
    };
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID, googleLoginOptions);
  }

  signOut(): void {
    this.authService.signOut();
  }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.store.dispatch(new BoardActions.UserRegister(user));
      this.user = user;
      this.loggedIn = (user != null);
      if (user !== null) {
        this.getLayouts();
        this.getUserBoards(this.user.email);
      }
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
}
