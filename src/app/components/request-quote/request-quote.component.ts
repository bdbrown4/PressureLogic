import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, Subject, takeUntil } from 'rxjs';
import { EmailRequest } from 'src/app/models/email.interface';
import { Service } from 'src/app/models/service.interface';
import { EmailService } from 'src/app/service/email-service.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-request-quote',
  templateUrl: './request-quote.component.html',
  styleUrls: ['./request-quote.component.scss']
})
export class RequestQuoteComponent implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  form: FormGroup = this.formBuilder.group({
    firstName: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    services: new FormControl('', Validators.required)
  });
  allChecked: boolean = false;
  processing: boolean = false;
  services: Service = {
    name: 'All Listed Below',
    checked: false,
    subservices: [
      {name: 'House', checked: false},
      {name: 'Driveway', checked: false},
      {name: 'Roof', checked: false},
      {name: 'Deck/Patio', checked: false},
    ] as Service[],
  };

  constructor(private formBuilder: FormBuilder, private emailService: EmailService, private router: Router, public dialog: MatDialog) {

  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialog(): void {
    this.dialog.open(DialogComponent, {
      width: '250px',
      closeOnNavigation: true
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => this.navigateHome());
  }

  isValid(): boolean {
    return this.services.checked || (this.services.subservices?.some(c => c.checked) ?? false);
  }

  async submit(): Promise<void> {
    this.form.get('services')?.markAsTouched();
    if(this.form.valid && this.isValid()) {
      this.processing = !this.processing
      const services = this.services.subservices?.filter(x => x.checked).map(x => x.name).join(', ').trim();
      const emailRequest: EmailRequest = {
        firstName: this.form.get('firstName')?.value,
        lastName: this.form.get('lastName')?.value,
        phone: this.form.get('phone')?.value,
        email: this.form.get('email')?.value,
        services: services ?? ''
      }
      this.emailService.sendEmail(emailRequest).pipe(
          catchError(async () => {
            return await this.timeoutForSpinnerError();
          }),
          takeUntil(this.destroy$)).subscribe(() => {
            this.processing = !this.processing;
            this.openDialog();
      });
    }
  }

  navigateHome(): Promise<boolean> {
    return this.router.navigate(['home']);
  }

  async timeoutForSpinnerError() {
    return new Promise(() => {
      setTimeout(() => {
        this.processing = !this.processing;
        alert('There was an error, please try again!');
      }, 1000);
    });
  }

  updateAllComplete() {
    this.allChecked = this.services.subservices != null && this.services.subservices.every(t => t.checked);
  }

  someComplete(): boolean {
    if (this.services.subservices == null) {
      return false;
    }
    return this.services.subservices.filter(t => t.checked).length > 0 && !this.allChecked;
  }

  setAll(checked: boolean) {
    this.allChecked = checked;
    if (this.services.subservices == null) {
      return;
    }
    this.services.subservices.forEach(t => (t.checked = checked));
  }

  setSpecificService(service: Service) {
    if (this.services.subservices == null) {
      return;
    }
    this.services.subservices.filter(x => x.name == service.name).map(c => c.checked = service.checked);
  }

}
