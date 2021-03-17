import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(private http: HttpClient) { }

  getBoard(id): any {
    return this.http.get('http://localhost:3000/api/boards/' + id, {
      observe: 'body',
      responseType: 'json'
    });
  }

  getUserBoards(email): any {
    return this.http.get('http://localhost:3000/boards/user/' + email, {
      observe: 'body',
      responseType: 'json'
    });
  }

  createBoard(data): any {
    return this.http.post('http://localhost:3000/boards', data);
  }
}
