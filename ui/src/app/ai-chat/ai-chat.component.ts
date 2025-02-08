import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-ai-chat',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class AIChatComponent implements AfterViewInit, OnInit {



  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();

  }

  ngAfterViewInit() {

  }





}
