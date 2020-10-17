import { Component, OnInit, ViewChild } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import { combineLatest } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarService } from './calendar.service';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @ViewChild('calender', {static: true}) calendarComponent: FullCalendarComponent;
  title = 'calendar';
  calendarPlugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin];
  calendarEvents: EventInput[] = [];
  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarRender();
    this.getWorklogs();
  }

  calendarRender() {
    this.calendarComponent.eventRender.subscribe((eventInfo) => {
      const duration = moment(eventInfo.event.end).diff(eventInfo.event.start, 'hours');
      if (duration > 6) {
        eventInfo.el.querySelector('.fc-content').parentElement
        .innerHTML += `
          <div class="split-wrapper">
            <a class="btn-split"
               onclick='btnSplitCaller.callerId="${eventInfo.event.id}";btnSplitCaller.click()'>
               <i class="fas fa-code-branch"></i>
               Automatische Pause
            </a>
          </div>`;
      }
    });
  }
  getWorklogs(): void {
  this.calendarService.getWorklogs()
  .subscribe(data => {
    this.calendarEvents = [];
    this.calendarEvents = data;
  });

  }

  eventSplitClick(e: any): void {
    const selectedEvent = this.calendarComponent.getApi().getEventById(e.target.callerId);
    const middle = moment(selectedEvent.end).clone()
    .diff(selectedEvent.start, 'hours') / 2;

    const newEnd = moment(selectedEvent.end)
    .clone()
    .add(middle * -1, 'hours');

    const pauseEvent: EventInput = {
      id: `Event_Pause_${e.target.callerId}`,
      title: 'Pause',
      start: newEnd.toISOString(),
      end: moment(newEnd)
      .clone()
      .add(1, 'hour').toISOString(),
      backgroundColor: '#e34435'
    };

    const thirdEvent: EventInput = {
      id: `Event_Extra_${e.target.callerId}`,
      title: selectedEvent.title,
      start: newEnd
      .clone()
      .add(1, 'hour').toISOString(),
      end: moment(selectedEvent.end)
      .clone()
      .add(1, 'hour')
      .toISOString()
    };

    selectedEvent.setEnd(newEnd.toISOString());

    this.calendarComponent.getApi().addEvent(pauseEvent);

    this.calendarComponent.getApi().addEvent(thirdEvent);

    combineLatest(this.calendarService.updateWorklog(selectedEvent),
                  this.calendarService.addWorklog(pauseEvent),
                  this.calendarService.addWorklog(thirdEvent))
                  .subscribe(([first, second, third]) => {
                    if (first.length && second.length && third.length) {
                      alert('your changes has been saved');
                    }
                  });
  }
}
