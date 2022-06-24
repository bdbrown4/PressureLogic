import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailRequest } from '../models/email.interface';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private httpClient: HttpClient) { }

  sendEmail(request: EmailRequest): Observable<string> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.httpClient.post<string>('https://kb635zydi3j7qffubwxv633ima0mvmsx.lambda-url.us-east-1.on.aws', request, { headers: headers});
  }
}
