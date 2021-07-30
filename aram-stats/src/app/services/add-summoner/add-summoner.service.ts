import { SummonerModel } from './../../classes/summoner-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AddSummonerService {
   
  url = 'http://localhost:3000/summoner';
  constructor(private http: HttpClient) {
  }


  addSummoner(user: SummonerModel){
    return this.http.post<any>(this.url, user);
  }
}
