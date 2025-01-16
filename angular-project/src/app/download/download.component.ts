
import {Component, inject, Inject, OnInit} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import {UploadComponent} from "../upload/upload.component";
import {AuthenticationService} from "../api-authorization/authentication.service";

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [
    FormsModule,
    UploadComponent
  ],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {
  private authService: AuthenticationService = inject(AuthenticationService);

  isCreate: boolean;
  description: string;
  fileDetails: FileToCreate;
  files: File[] = [];
  public response: {dbPath: "", fileName: "", extension: "", size: ""}

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string){}

  ngOnInit(){
    this.isCreate = false;
    this.description = ""
    this.getFiles()
  }

  onCreate = () => {
    this.fileDetails = {
      description: this.description,
      path: this.response.dbPath,
      name: this.response.fileName,
      extension: this.response.extension,
      size: this.response.size,
      author: this.authService.getCurrentUsername()

    }

    console.log(this.response)
    debugger
    this.http.post(`${this.baseUrl}/download`, this.fileDetails)
      .subscribe({
        next: _ => {
          this.getFiles();
          this.isCreate = false;
        },
        error: (err: HttpErrorResponse) => console.log(err)
      });
  }

  private getFiles = () => {
    this.http.get(`${this.baseUrl}/download`)
      .subscribe({
        next: (res) => this.files = res as File[],
        error: (err: HttpErrorResponse) => console.log(err)
      });
  }

  returnToCreate = () => {
    this.isCreate = true;
    this.description = '';
  }

  public uploadFinished = (event) => {
    this.response = event
  }

}

export interface File {
  id: string,
  author: string,
  path: string,
  name: string,
  extension: string,
  description: string,
  size: string
}

export interface FileToCreate {
  description: string,
  path: string,
  name: string,
  extension: string,
  author: string
  size: string
}
