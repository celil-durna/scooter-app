import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
  selector: 'app-mojtaba-maleknejad',
  standalone: true,
  templateUrl: './mojtaba-maleknejad.component.html',
  styleUrls: ['./mojtaba-maleknejad.component.css'],
})
export class MojtabaMalekNejadComponent implements OnInit {
  
  public myName?: NameInfo;

  constructor(private aboutService: AboutService) {
  }

  ngOnInit(): void {
    this.aboutService.getMojtabaMalekNejadInfo().subscribe({
      // next: Unser Wert kam erfolgreich an!
      next: (val) => {
        this.myName = val;
      },

      // error: Es gab einen Fehler
      error: (err) => {
        console.error(err);
        this.myName = {
          firstName: 'Error!',
          lastName: 'Error!',
        };
      },
    });
  }
}
