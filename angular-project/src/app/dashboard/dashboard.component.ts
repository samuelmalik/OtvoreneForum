 import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TestService } from '../test.service';
 import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {passwordStrengthValidator} from "../api-authorization/password-validators";
import {equalValuesValidator} from "../api-authorization/password-validators";
 import {MatFormField, MatLabel} from "@angular/material/form-field";
 import {MatInput} from "@angular/material/input";
 import {AuthenticationService, ChangePasswordInterface, ChangePasswordResponse} from "../api-authorization/authentication.service";
 import {HttpErrorResponse} from "@angular/common/http";
 import { CommonModule } from '@angular/common';
 import {max, min} from "rxjs";
 import {ForumService, UpdateStatusInterface} from "../services/forum.service";


 @Component({
  selector: 'app-dashboard',
  standalone: true,
   imports: [
     NgIf,
     AsyncPipe,
     MatList,
     MatListItem,
     NgForOf,
     MatTable,
     MatHeaderCell,
     MatCell,
     MatCellDef,
     MatHeaderCellDef,
     MatColumnDef,
     MatRowDef,
     MatHeaderRowDef,
     MatHeaderRow,
     MatRow,
     FormsModule,
     MatFormField,
     MatInput,
     MatLabel,
     ReactiveFormsModule,
     NgClass
   ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private testService = inject(TestService);
  private destroyRef = inject(DestroyRef);
  private authService :AuthenticationService = inject(AuthenticationService)
   private forumService :ForumService = inject(ForumService)
   public UsernameForm: FormGroup;
  public  PasswordForm: FormGroup;
   public  StatusForm: FormGroup;

  private currentUserId :string;
  public currentUserName;
  public errorMessage ="";
  public errorMessageName ="";
  public statusChangeIndicator: boolean = false;
   maxChars = 100;
   remainingChars = this.maxChars;



  dataSource: MatTableDataSource<string>;

  constructor(private formBuilder: FormBuilder,) {

    this.PasswordForm = this.formBuilder.group({
      oldPassword: [''],
      newPassword: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('newPassword'))
    });

    this.UsernameForm = this.formBuilder.group({
      newUsername: new FormControl('',  [Validators.required, Validators.minLength(6), this.noWhitespaceValidator])
    });

    this.StatusForm = this.formBuilder.group({
      newStatus: new FormControl('', Validators.maxLength(this.maxChars))
    });

    this.StatusForm.get('newStatus')?.valueChanges.subscribe(value => {
      this.updateCharCount();
    });


  }
   get newPasswordFormField()
   {
     return this.PasswordForm.get('newPassword');
   }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentId();
    this.currentUserName = this.authService.getCurrentUsername();
    this.forumService.getStatus(this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
      this.StatusForm.get("newStatus")?.setValue(data.status)
      });
  }
   updateCharCount() {
     const statusValue = this.StatusForm.get('newStatus')?.value || '';
     this.remainingChars = this.maxChars - statusValue.length;
   }

  submitPasswordForm(){
    if(this.PasswordForm.value.newPassword == this.PasswordForm.value.confirmPassword){
      let data :ChangePasswordInterface ={
        id: this.currentUserId,
        oldPassword: this.PasswordForm.value.oldPassword,
        newPassword: this.PasswordForm.value.newPassword
      }

      this.authService.changePassword(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
        this.errorMessage = data.errorMessage;
      });
    } else {
      this.errorMessage = "Heslá sa nezhodujú"
    }
  }
   public noWhitespaceValidator(control: FormControl) {
     return (control.value || '').trim().length? null : { 'whitespace': true };
   }
   submitUsernameForm(){
     if(this.UsernameForm.valid && this.UsernameForm.value.newUsername.length >0){
       let data :ChangePasswordInterface ={
         id: this.currentUserId,
         oldPassword: "",
         newPassword: this.UsernameForm.value.newUsername
       }

       this.authService.changeUsername(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(output =>{
         if (output == false){
           if (this.UsernameForm.hasError("whitespace")){
             this.errorMessage = "Meno nemôže obsahovať medzery"
           }
          else {
             this.errorMessageName = "Meno už existuje"
           }
         } else {
           this.errorMessageName = "Meno úspešne zmenené"
           this.currentUserName = data.newPassword
           localStorage.setItem('username', data.newPassword);
         }
       });
     }
     else {
       this.errorMessageName = "Meno musí mať aspoň 6 znakov a nesmie obsahovať medzery"
     }
   }

   submitStatusForm() {
     const statusValue = this.StatusForm.value.newStatus.trim();

     if (statusValue.length === 0) {
       console.log("Status nemôže byť prázdny.");
       return;
     }

     if (statusValue.length > this.maxChars) {
       console.log("Status je príliš dlhý.");
       return;
     }

     let data: UpdateStatusInterface = {
       userId: this.currentUserId,
       status: statusValue
     };

     this.forumService.updateStatus(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
       this.statusChangeIndicator = true;

       this.StatusForm.reset();
       this.remainingChars = this.maxChars;

       setTimeout(() => {
         this.statusChangeIndicator = false;
       }, 3000);
     });
   }

}
