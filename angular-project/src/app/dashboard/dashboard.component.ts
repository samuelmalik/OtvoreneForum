import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TestService } from '../test.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    MatRow
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private testService = inject(TestService);
  private destroyRef = inject(DestroyRef)

  dataSource: MatTableDataSource<string>;

  ngOnInit(): void {
    this.testService.getNames()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(names => this.dataSource = new MatTableDataSource(names));
  }
}
