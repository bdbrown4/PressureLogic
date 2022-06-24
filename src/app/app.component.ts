import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PressureLogicLLC';
  toggleSideNav(drawer: MatSidenav): void {
    drawer.opened ? drawer.close() : drawer.open();
  }
}
