import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { boardReducer } from './reducers/board.reducer';
import { cardsBlockReducer } from './reducers/board.reducer';
import { socketStateReducer } from './reducers/board.reducer';
import { userReducer } from './reducers/board.reducer';
import { userColorsReducer } from './reducers/board.reducer';
import { onlineUsersReducer } from './reducers/board.reducer';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula';
import { MatButtonModule } from '@angular/material/button';
import { BoardComponent, OpenCardDialogComponent } from './components/board/board.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { LandingComponent } from './components/landing/landing.component';
import { MdePopoverModule } from '@material-extended/mde';
import { MatListModule } from '@angular/material/list';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'board/:id', component: BoardComponent },
  { path: 'index', component: LandingComponent },
  { path: '', redirectTo: '/index', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BoardComponent,
    OpenCardDialogComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSelectModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragulaModule.forRoot(),
    MatButtonModule,
    RouterModule.forRoot(routes),
    FontAwesomeModule,
    MatDialogModule,
    MatInputModule,
    StoreModule.forRoot({ board: boardReducer, cardsBlock: cardsBlockReducer, user: userReducer, onlineUsers: onlineUsersReducer, socketState: socketStateReducer, userColors: userColorsReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 15
    }),
    TextFieldModule,
    MatTooltipModule,
    MatCardModule,
    SocialLoginModule,
    MdePopoverModule,
    MatListModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '<YOUR_GOOGLE_PROVIDER_CLIENT_ID>'
            )
          },
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
