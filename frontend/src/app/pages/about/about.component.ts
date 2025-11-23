import { Component } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { DafinaKastratiComponent } from 'src/app/components/dafina-kastrati/dafina-kastrati.component'; 
import { JonasHeiligComponent } from 'src/app/components/jonas-heilig/jonas-heilig.component';
import { NaserThaqiComponent } from 'src/app/components/naser-thaqi/naser-thaqi.component';
import { CelilDurnaComponent } from 'src/app/components/celil-durna/celil-durna.component';
import { MojtabaMalekNejadComponent } from 'src/app/components/mojtaba-maleknejad/mojtaba-maleknejad.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { SampleService } from 'src/app/services/sample.service';
import { MichaelHuberComponent } from 'src/app/components/michael-huber/michael-huber.component'; 




@Component({
  standalone: true,
  imports: [DafinaKastratiComponent, MichaelHuberComponent, UserInputComponent, BackButtonComponent, JonasHeiligComponent, NaserThaqiComponent, CelilDurnaComponent, MojtabaMalekNejadComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  constructor(public sampleService: SampleService) {
  }
}
