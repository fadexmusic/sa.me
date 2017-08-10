import { SearchService } from './search.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchService]
})
export class SearchComponent implements OnInit {
  @ViewChild('searchRes') searchRes; 
  searchForm: FormGroup;
  results: any[];
  constructor(private fb: FormBuilder, private ss: SearchService) {
    this.searchForm = fb.group({
      query: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.searchForm.get('query').valueChanges.subscribe(value => {
      if (value != "" && value != null) {
        this.ss.search(value).subscribe(res => {
          this.results = res;
        });
      } else {
        this.results = null;
      }
    });
  }
  close(): void {
    this.searchForm.reset();
    this.results = null;
  }
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == "Escape") {
      this.close();
    }
  }
  onClick($event): void {
    if (!this.searchRes.nativeElement.contains(event.target)){
      this.close();
    }
  }
}
