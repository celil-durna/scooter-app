import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
    selector: 'app-jonas-heilig',
    standalone: true,
    templateUrl: './jonas-heilig.component.html',
    styleUrls: ['./jonas-heilig.component.css'],
})
export class JonasHeiligComponent implements OnInit{
    public nameInfo?: NameInfo; 
    
    constructor(private aboutService: AboutService) { }

    ngOnInit(): void {
        this.aboutService.getJonasHeiligInfo().subscribe({
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
