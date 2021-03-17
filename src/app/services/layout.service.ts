import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(private http: HttpClient) { }

  getLayouts(): any {
    return this.http.get('http://localhost:3000/layouts', {
      observe: 'body',
      responseType: 'json'
    });
  }

  getLayout(id): any {
    return this.http.get('http://localhost:3000/layouts/' + id, {
      observe: 'body',
      responseType: 'json'
    });
  }
}
