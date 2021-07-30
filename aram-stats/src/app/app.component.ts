import { AddSummonerService } from './services/add-summoner/add-summoner.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SummonerModel } from './classes/summoner-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{
  title = 'angular-app';

  summonerModel = new SummonerModel('Test');

  constructor(private _AddSummonerService: AddSummonerService){
    
  }
  ngOnInit (){}
  
  
  onSubmit(){
    console.log(this.summonerModel)
    this._AddSummonerService.addSummoner(this.summonerModel)
    .subscribe(
      data =>console.log('Success!!!', data), 
      error => console.error('Error', error)
      )
  }


}
