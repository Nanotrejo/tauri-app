import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-status',
  templateUrl: './check-status.component.html',
  styleUrls: ['./check-status.component.css']
})
export class CheckStatusComponent implements OnChanges, OnDestroy, OnInit {
  
  @Input() system: string= ''
  @Input() ping: {ip: string, status: boolean, count: number}[] = [];
  dateNow: Date = new Date();
  dateInterval: any
  
  ngOnInit(): void {
    this.getDate()
  }
  ngOnDestroy(): void {
    clearInterval(this.dateInterval)
  }
  ngOnChanges() {
  }

  // create date for view
  getDate() {
    this.dateInterval = setInterval(() => {
    this.dateNow = new Date();
    }, 1000);
  }
}
