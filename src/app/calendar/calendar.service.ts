import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventApi, EventInput } from '@fullcalendar/core';

@Injectable({ providedIn: 'root' })
export class CalendarService {

  constructor(private http: HttpClient) {}

  getWorklogs(): Observable<Array<EventInput>> {
    let params: HttpParams = new HttpParams();
    const url = 'http://localhost:3000/api/worklogs';
    params = params.append('startDate', '2020-10-15');
    params = params.append('endDate', '2020-11-01');

    return this.http.get<Array<EventInput>>(url, {params});
  }

  addWorklog(event: EventInput): Observable<{message: string}> {
    return this.http.post<{message: string}>('http://localhost:3000/api/worklogs', event);
  }

  updateWorklog(event: EventInput): Observable<{message: string}> {
    return this.http.put<{message: string}>(`http://localhost:3000/api/worklogs/${event.id}`, event);
  }

  removeWorklog(eventId: string | number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`http://localhost:3000/api/worklogs/${eventId}`);
  }
}
