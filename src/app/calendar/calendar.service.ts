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

  addWorklog(event: EventInput): Observable<string> {
    return this.http.post<string>('http://localhost:3000/api/worklogs', event);
  }

  updateWorklog(event: EventApi): Observable<string> {
    const newEvent: EventInput = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end
    };
    return this.http.put<string>(`http://localhost:3000/api/worklogs/${event.id}`, newEvent);
  }
}
