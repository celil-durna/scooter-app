import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
    selector: 'app-naser-thaqi',
    standalone: true,
    templateUrl: './naser-thaqi.component.html',
    styleUrls: ['./naser-thaqi.component.css'],
})
export class NaserThaqiComponent implements OnInit{
    public nameInfo?: NameInfo; 
    
    constructor(private aboutService: AboutService) { }

    ngOnInit(): void {
        this.aboutService.getNaserThaqiInfo().subscribe({
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
