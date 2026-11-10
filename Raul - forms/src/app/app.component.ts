import { Component } from '@angular/core';
import { PostFormComponent } from './post-form/post-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PostFormComponent],
  template: '<app-post-form />',
})
export class AppComponent {}
