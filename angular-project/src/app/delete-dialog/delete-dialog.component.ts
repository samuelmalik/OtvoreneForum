import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon
  ],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.css'
})
export class DeleteDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  delete(data: string){
    console.log(data)
    this.dialogRef.close(data);
  }

  deleteInt(data: number){
    console.log(data)
    this.dialogRef.close(data);
  }

  closeDialog(){
    this.dialogRef.close();
  }

}

export interface DialogData {
  type: string;
  stringParameter: string;
  integerParameter: number;
}
