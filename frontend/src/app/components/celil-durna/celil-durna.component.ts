import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
    selector: 'app-celil-durna',
    standalone: true,
    templateUrl: './celil-durna.component.html',
    styleUrls: ['./celil-durna.component.css'],
})
export class CelilDurnaComponent implements OnInit{
    public nameInfo?: NameInfo; 
    
    constructor(private aboutService: AboutService) { }

    ngOnInit(): void {
        this.aboutService.getCelilDurnaInfo().subscribe({
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
