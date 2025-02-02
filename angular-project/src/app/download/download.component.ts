
import {Component, inject, Inject, OnInit, ChangeDetectionStrategy, signal, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UploadComponent} from "../upload/upload.component";
import {AuthenticationService} from "../api-authorization/authentication.service";
import {FileService} from "../services/file.service";
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'app-download',
  standalone: true,
  imports: [
    FormsModule,
    UploadComponent,
    MatExpansionModule,
    MatButton,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {
  private authService: AuthenticationService = inject(AuthenticationService);

  @ViewChild(UploadComponent) uploadComponent;

  showLoader: boolean
  isCreate: boolean;
  description: string;
  fileDetails: FileToCreate;
  files: File[] = [];
  public response: {dbPath: "", fileName: "", extension: "", size: ""}

  readonly panelOpenState = signal(false);
  loggedRole: string;
  currentUserId: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private fileService: FileService){}

  message: string;
  progress: number;
  ngOnInit(){
    this.showLoader = true;
    this.isCreate = false;
    this.description = ""
    this.getFiles()
    this.loggedRole = this.authService.getRole();
    this.currentUserId = this.authService.getCurrentId();
  }

  onCreate = () => {
    //upload file to BE
    this.uploadComponent.uploadFileToServer()
  }

  private getFiles = () => {
    this.http.get(`${this.baseUrl}/download`)
      .subscribe(
        {
        next: (res) => this.files = res as File[],
        //this.showLoader = false;
        error: (err: HttpErrorResponse) => console.log(err),
        complete: () => this.showLoader = false,

      });
  }


  public uploadFinished = (event) => {
    this.response = event

    this.fileDetails = {
      description: this.description,
      path: this.response.dbPath,
      name: this.response.fileName,
      extension: this.response.extension,
      size: this.response.size,
      author: this.authService.getCurrentUsername(),
      authorId: this.authService.getCurrentId()
    }

    //upload details about file to DB
    console.log(this.response)
    console.log(this.fileDetails)
    this.http.post(`${this.baseUrl}/download`, this.fileDetails)
      .subscribe({
        next: _ => {
          this.getFiles();
          this.isCreate = false;
        },
        error: (err: HttpErrorResponse) => console.log(err)
      });
  }

  // download logic
  download = (path: string) => {
    this.fileService.download(path)
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.progress = Math.round((100 * event.loaded) / event.total);
        else if (event.type === HttpEventType.Response) {
          this.message = 'Download success.';
          this.downloadFile(event, path);
        }
      });

    console.log(path);
  }

  private downloadFile = (data: HttpResponse<Blob>, path: string) => {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = path.slice(path.lastIndexOf('\\') + 19);
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }

  delete(path: string){
    console.log("Delete file at: " + path)
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
  authorId: string,
}

export interface FileToCreate {
  description: string,
  path: string,
  name: string,
  extension: string,
  author: string,
  size: string,
  authorId: string,
}
