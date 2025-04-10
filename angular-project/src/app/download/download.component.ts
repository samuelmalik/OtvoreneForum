
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
import {GroupsService, GetGroupsDtoInterface} from "../services/groups.service";
import {concatAll} from "rxjs";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {DeleteDialogComponent, DialogData} from "../delete-dialog/delete-dialog.component";
import {group} from "@angular/animations";


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
  private groupService: GroupsService = inject(GroupsService);
  readonly dialog = inject(MatDialog);

  @ViewChild(UploadComponent) uploadComponent;

  fileChosen: boolean
  showLoader: boolean
  isCreate: boolean;
  description: string;
  fileDetails: FileToCreate;
  files: File[] = [];
  public response: {dbPath: "", fileName: "", extension: "", size: ""}

  readonly panelOpenState = signal(false);
  loggedRole: string;
  currentUserId: string;

  currentUserGroupId
  groups: GetGroupsDtoInterface[] = [];

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
    this.fileChosen = false

    this.groupService.getCurrentUserGroupId(this.currentUserId).subscribe(data=>{
      this.currentUserGroupId = data;
    })

    this.groupService.getAllGroups().subscribe(data =>{
      this.groups = data
    })
  }

  onCreate = () => {
    this.uploadComponent.uploadFileToServer()
    this.fileChosen = false
  }

  private getFiles = () => {
    this.http.get(`${this.baseUrl}/download`)
      .subscribe(
        {
        next: (res) => this.files = res as File[],
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
    console.log(this.fileDetails)
    this.http.post(`${this.baseUrl}/download`, this.fileDetails)
      .subscribe({
        next: _ => {
          this.getFiles();
          this.isCreate = false;
          this.description = "";
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

  fileChosenEvent(chosen: boolean) {
    console.log('Správa z child komponentu:', chosen);
    this.fileChosen = chosen
  }

  delete(path: string){
    //this.fileService.delete(path).subscribe();
    //this.files = this.files.filter(item => item.path != path)
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {type: "file", stringParameter: path},
      width: '40vw',
      height: 'auto',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log('The dialog was closed' + result);
        this.fileService.delete(result).subscribe();
        this.files = this.files.filter(item => item.path != result)
      }
    });
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
  group: string
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
