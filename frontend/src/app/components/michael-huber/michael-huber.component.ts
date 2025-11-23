import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
    selector: 'app-michael-huber',
    standalone: true,
    templateUrl: './michael-huber.component.html',
    styleUrls: ['./michael-huber.component.css'],
})
export class MichaelHuberComponent implements OnInit{
    public nameInfo?: NameInfo; 
    
    constructor(private aboutService: AboutService) { }

    ngOnInit(): void {
        this.aboutService.getMichaelHuberInfo().subscribe({
            next: (val) => {
                this.nameInfo = val;
            },
            error: (err) => {
                console.error(err);
                this.nameInfo = {
                    firstName: 'error',
                    lastName: 'error',
                    email: 'error'
                };
            },
        });
    }
 }
