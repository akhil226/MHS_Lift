import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AvailableUrls } from './../shared/constants/subheader.constant';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  showSubHeader$: Observable<string> = of('');
  constructor(
    private router: Router
  ) {
    this.showSubHeader$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      startWith(this.router),
      map((event: any) => AvailableUrls.some(url => url === event.url.split('?')[0]) ? event.url : ''));
  }

  ngOnInit(): void {

  }
}
