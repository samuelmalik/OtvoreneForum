import {Component, DestroyRef, inject, Inject, OnInit, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {UserDtoInterface} from "../services/forum.service";
import {
  AuthenticationService,
  AddClaimInterface,
  UpdateNoteInterface
} from "../api-authorization/authentication.service";
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SharedService, roleInterface} from "../services/shared.service";
import {ForumService} from "../services/forum.service";
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
    imports: [MatDialogModule, MatFormFieldModule, MatSelectModule, FormsModule, NgClass, MatIcon, MatIconButton],
  templateUrl: './user-info-dialog.component.html',
  styleUrl: './user-info-dialog.component.css',
})
export class UserInfoDialogComponent implements OnInit, OnDestroy{
  public authService: AuthenticationService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private sharedService: SharedService = inject(SharedService);
  readonly dialogRef = inject(MatDialogRef<UserInfoDialogComponent>);

  loggedRole = this.authService.role
  selected = "student"
  note: string
  noteUpdated = false;
  noteLoaded = false;

  claimData: AddClaimInterface ={
    userId: "",
    type: "",
    value: ""
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDtoInterface) { }

  ngOnInit() {
    this.selected = this.data.role
    this.authService.getNote(this.authService.getCurrentId(), this.data.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.note = data.note;
      this.noteLoaded = true
    })
  }

  ngOnDestroy() {
    console.log("dialog zniceny")
    if (this.claimData.userId != null && this.claimData.value != null){
      //prepísanie role v ForumPage user liste
      let roleData: roleInterface = {
        userId: this.claimData.userId,
        role: this.claimData.value
      }
      this.sharedService.setData(roleData);
    }
  }

  updateNote(){
    this.noteUpdated = false;
    let updateNoteData: UpdateNoteInterface = {
      creatorId: this.authService.getCurrentId(),
      addresserId: this.data.id,
      text: this.note
    }

    this.authService.setNote(updateNoteData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.noteUpdated = true
    })
  }

  changeRole(){
    // kód na nastavenie rolí v databáze tabuľke userov
    console.log("menim rolu")
    this.claimData ={
      userId : this.data.id,
      type : "role",
      value : this.selected
    }
    this.authService.setRole(this.claimData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
    })
  }

  deleteUser(id: string){
    console.log("vymazavanie usera s idčkom: " + id)
    this.authService.deleteUser(id).subscribe()
    
    //vymazanie usera z listu na forum page
    this.sharedService.sendDeletedUserData(this.data.id)
    this.dialogRef.close()
  }

}
