import {Component, DestroyRef, inject, Inject, OnInit, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {UserDtoInterface} from "../services/forum.service";
import {AuthenticationService, AddClaimInterface} from "../api-authorization/authentication.service";
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SharedService, roleInterface} from "../services/shared.service";

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './user-info-dialog.component.html',
  styleUrl: './user-info-dialog.component.css',
})
export class UserInfoDialogComponent implements OnInit, OnDestroy{
  private authService: AuthenticationService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private sharedService: SharedService = inject(SharedService);

  loggedRole = this.authService.role
  selected = "student"

  claimData: AddClaimInterface ={
    userId: "",
    type: "",
    value: ""
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDtoInterface) { }

  ngOnInit() {
    this.selected = this.data.role
    console.log(this.selected)
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
  }

