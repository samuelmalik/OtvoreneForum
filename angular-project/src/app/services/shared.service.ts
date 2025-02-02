import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private subject = new Subject<void>();
  private notificationCheckSubject = new Subject<void>();
  private data = new Subject<roleInterface>();
  data$ = this.data.asObservable();
  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent(): Observable<any>{
    return this.subject.asObservable();
  }

  setData(data: roleInterface){
    this.data.next(data);
  }

  sendNotificationDeletedEvent() {
    this.notificationCheckSubject.next();
  }

  getNotificationDeleteEvent(): Observable<any>{
    return this.notificationCheckSubject.asObservable();
  }

}

export interface roleInterface{
  userId: string;
  role: string;
}
