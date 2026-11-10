import { Component, DestroyRef, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as NgbDateStruct | null;
  if (!value) {
    return null;
  }
  const picked = new Date(value.year, value.month - 1, value.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgbDatepickerModule, JsonPipe],
  templateUrl: './post-form.component.html',
})
export class PostFormComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = ['Tecnología', 'Diseño', 'Programación', 'Novedades'];

  readonly minDate: NgbDateStruct = (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  })();

  submittedData: unknown = null;

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tags: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.pattern(
          /^\s*[\w\-áéíóúüñÁÉÍÓÚÜÑ ]+(\s*,\s*[\w\-áéíóúüñÁÉÍÓÚÜÑ ]+)*\s*,?\s*$/
        ),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    publishNow: new FormControl(true, { nonNullable: true }),
    publishDate: new FormControl<NgbDateStruct | null>({ value: null, disabled: true }),
  });

  constructor() {
    this.form.controls.publishNow.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((publishNow) => {
        const dateControl = this.form.controls.publishDate;
        if (publishNow) {
          dateControl.reset(null);
          dateControl.clearValidators();
          dateControl.disable();
        } else {
          dateControl.setValidators([Validators.required, futureDateValidator]);
          dateControl.enable();
        }
        dateControl.updateValueAndValidity();
      });
  }

  get f() {
    return this.form.controls;
  }

  state(control: AbstractControl): string {
    if (control.disabled || !(control.touched || control.dirty)) {
      return '';
    }
    return control.invalid ? 'is-invalid' : 'is-valid';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const date = value.publishDate;

    this.submittedData = {
      title: value.title.trim(),
      description: value.description.trim(),
      category: value.category,
      tags: value.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      email: value.email,
      publishNow: value.publishNow,
      publishDate: date ? new Date(date.year, date.month - 1, date.day).toISOString() : null,
    };
  }

  onReset(): void {
    this.form.reset({
      title: '',
      description: '',
      category: '',
      tags: '',
      email: '',
      publishNow: true,
      publishDate: null,
    });
    this.submittedData = null;
  }
}
