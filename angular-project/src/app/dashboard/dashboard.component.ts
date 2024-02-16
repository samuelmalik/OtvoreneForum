import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { TestService } from '../test.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';

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
export class DashboardComponent implements OnInit, OnDestroy {
  private testService = inject(TestService);

  private unsubscribe$ = new Subject<void>();
  dataSource: MatTableDataSource<string>;

  ngOnInit(): void {
    this.testService.getNames()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(names => this.dataSource = new MatTableDataSource(names));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
