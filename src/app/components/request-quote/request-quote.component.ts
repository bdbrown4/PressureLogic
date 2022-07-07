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
    streetAddress: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    zip: new FormControl(null, [Validators.required, Validators.maxLength(5)]),
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
  selectedState: string = '';
  readonly usStates = [
    { name: 'ALABAMA', abbreviation: 'AL'},
    { name: 'ALASKA', abbreviation: 'AK'},
    { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
    { name: 'ARIZONA', abbreviation: 'AZ'},
    { name: 'ARKANSAS', abbreviation: 'AR'},
    { name: 'CALIFORNIA', abbreviation: 'CA'},
    { name: 'COLORADO', abbreviation: 'CO'},
    { name: 'CONNECTICUT', abbreviation: 'CT'},
    { name: 'DELAWARE', abbreviation: 'DE'},
    { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
    { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
    { name: 'FLORIDA', abbreviation: 'FL'},
    { name: 'GEORGIA', abbreviation: 'GA'},
    { name: 'GUAM', abbreviation: 'GU'},
    { name: 'HAWAII', abbreviation: 'HI'},
    { name: 'IDAHO', abbreviation: 'ID'},
    { name: 'ILLINOIS', abbreviation: 'IL'},
    { name: 'INDIANA', abbreviation: 'IN'},
    { name: 'IOWA', abbreviation: 'IA'},
    { name: 'KANSAS', abbreviation: 'KS'},
    { name: 'KENTUCKY', abbreviation: 'KY'},
    { name: 'LOUISIANA', abbreviation: 'LA'},
    { name: 'MAINE', abbreviation: 'ME'},
    { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
    { name: 'MARYLAND', abbreviation: 'MD'},
    { name: 'MASSACHUSETTS', abbreviation: 'MA'},
    { name: 'MICHIGAN', abbreviation: 'MI'},
    { name: 'MINNESOTA', abbreviation: 'MN'},
    { name: 'MISSISSIPPI', abbreviation: 'MS'},
    { name: 'MISSOURI', abbreviation: 'MO'},
    { name: 'MONTANA', abbreviation: 'MT'},
    { name: 'NEBRASKA', abbreviation: 'NE'},
    { name: 'NEVADA', abbreviation: 'NV'},
    { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
    { name: 'NEW JERSEY', abbreviation: 'NJ'},
    { name: 'NEW MEXICO', abbreviation: 'NM'},
    { name: 'NEW YORK', abbreviation: 'NY'},
    { name: 'NORTH CAROLINA', abbreviation: 'NC'},
    { name: 'NORTH DAKOTA', abbreviation: 'ND'},
    { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
    { name: 'OHIO', abbreviation: 'OH'},
    { name: 'OKLAHOMA', abbreviation: 'OK'},
    { name: 'OREGON', abbreviation: 'OR'},
    { name: 'PALAU', abbreviation: 'PW'},
    { name: 'PENNSYLVANIA', abbreviation: 'PA'},
    { name: 'PUERTO RICO', abbreviation: 'PR'},
    { name: 'RHODE ISLAND', abbreviation: 'RI'},
    { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
    { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
    { name: 'TENNESSEE', abbreviation: 'TN'},
    { name: 'TEXAS', abbreviation: 'TX'},
    { name: 'UTAH', abbreviation: 'UT'},
    { name: 'VERMONT', abbreviation: 'VT'},
    { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
    { name: 'VIRGINIA', abbreviation: 'VA'},
    { name: 'WASHINGTON', abbreviation: 'WA'},
    { name: 'WEST VIRGINIA', abbreviation: 'WV'},
    { name: 'WISCONSIN', abbreviation: 'WI'},
    { name: 'WYOMING', abbreviation: 'WY' }
];

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
        streetAddress: this.form.get('streetAddress')?.value,
        state: this.form.get('state')?.value,
        zip: this.form.get('zip')?.value,
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
