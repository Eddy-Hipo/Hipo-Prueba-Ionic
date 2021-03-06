import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service'
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/pt-br';

export class TODO {
  $key: string;
  userMessage: string;
  message: string;
  time: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  todoForm: FormGroup;
  todoForm2: FormGroup;
  userUid: string;
  userName: string;
  timeAc: Date;
  Chats: TODO[];

  constructor(
    private authService: AuthenticationService,
    private firebaseService: FirebaseService,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.authService.userDetails().subscribe(res => {
      console.log('datos res', res);
      if (res !== null) {
        this.userUid = res.uid;
        this.firebaseService.getName(this.userUid).subscribe(res=>{
          //console.log('datos res firebase', res);
          if(res !== null){
            //console.log('datos res firebase name', res['name']);
            this.userName = res['name']
          }
        })
      }
    }, err => {
      console.log('err', err);
    })
    this.todoForm = this.formBuilder.group({
      userMessage: [''],
      message:  [''],
    })
    this.firebaseService.getChats().subscribe((res) => {
      this.Chats = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      })
    });
  }

  todoList() {
    this.firebaseService.getChats()
    .subscribe((data) => {
      console.log(data)
    })
  }

  onSubmit(){
    if(!this.todoForm.valid){
      return false;
    } else {
      this.todoForm2 = this.formBuilder.group({
        userMessage: this.userName,
        message:  this.todoForm.value.message,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
      console.log("datos del unidos",this.todoForm2.value);
      this.firebaseService.create(this.todoForm2.value)
      .then(()=>{
        this.todoForm2.reset();
        this.todoForm.reset();
      }).catch((err)=>{
        console.log(err);
      });
    }
  }

}
