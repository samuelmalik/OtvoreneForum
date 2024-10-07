import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {UserDtoInterface} from "../services/forum.service";

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './user-info-dialog.component.html',
  styleUrl: './user-info-dialog.component.css'
})
export class UserInfoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDtoInterface) { }

}
