import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  progress: number;
  message: string;
  @Output() public onUploadFinished = new EventEmitter();

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }
  ngOnInit() {
  }
  uploadFile = (files) => {
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    this.http.post(`${this.baseUrl}/upload`, formData, {reportProgress: true, observe: 'events'})
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress)
            this.progress = Math.round(100 * event.loaded / event.total);
          else if (event.type === HttpEventType.Response) {
            this.message = 'Upload success.';
            this.onUploadFinished.emit(event.body);
          }
        },
        error: (err: HttpErrorResponse) => console.log(err)
      });
  }
}
