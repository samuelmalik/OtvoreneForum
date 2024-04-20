import {Component, inject, OnInit} from '@angular/core';
import { MainNavComponent } from './main-nav/main-nav.component';
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [MainNavComponent, RouterOutlet]
})
export class AppComponent implements OnInit{
  title = 'angular-project';
  private router = inject(Router);

  ngOnInit(){
    this.router.navigate(['/forum'])
  }
}
