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
 import {HttpErrorResponse} from "@angular/common/http";
 import { CommonModule } from '@angular/common';


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
  public UsernameForm: FormGroup;
  public  PasswordForm: FormGroup;



  dataSource: MatTableDataSource<string>;

  constructor(private formBuilder: FormBuilder,) {

    this.PasswordForm = this.formBuilder.group({
      oldPassword: [''],
      newPassword: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('newPassword'))
    });



  }
   get newPasswordFormField()
   {
     return this.PasswordForm.get('newPassword');
   }

  ngOnInit(): void {
    this.testService.getNames()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(names => this.dataSource = new MatTableDataSource(names));
  }

}
