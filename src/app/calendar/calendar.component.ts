import { Component, OnInit, ViewChild } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import { combineLatest } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
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
    this.getWorklogs();
  }

  getWorklogs(): void {
    this.calendarService.getWorklogs()
    .subscribe(data => {
      this.calendarEvents = [];
      this.calendarEvents = data;
      this.calendarRender();
    });
  }

  calendarRender() {
    this.calendarComponent.eventRender.subscribe((eventInfo) => {
      const duration = moment(eventInfo.event.end).diff(eventInfo.event.start, 'hours');
      // add Automatische Pause button
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
      // add delete button
      eventInfo.el.querySelector('.fc-content').parentElement
      .innerHTML += `
      <div class="split-wrapper">
        <a class="btn-delete"
           onclick='btnDeleteCaller.callerId="${eventInfo.event.id}";btnDeleteCaller.click()'>
           <i class="fas fa-trash-alt"></i>
           Delete
        </a>
      </div>`;

      let innerHtml = '';
      const eles = document.getElementsByClassName('fc-day');
      const sumWorkingHours = this.getSumOfWorkingHours(eventInfo.event.end);
      const sumPause =  this.getSumOfPause(eventInfo.event.end);
      if (sumWorkingHours) {
        innerHtml = `<div class="sumHours">Work Hours: ${sumWorkingHours} </div>`;
      }
      if (sumPause) {
        innerHtml += `<div class="sumHours">Break Hours: ${sumPause} </div>`;
      }

      // this timeout is important, because we need to separated thread, otherwise we need to overrider fullcalendar source
      setTimeout(() => {
        eles[0].innerHTML = innerHtml;
      }, 0);
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
    const newEvent: EventInput = {
      id: selectedEvent.id,
      title: selectedEvent.title,
      start: selectedEvent.start,
      end: selectedEvent.end
    };

    combineLatest(this.calendarService.updateWorklog(newEvent),
                  this.calendarService.addWorklog(pauseEvent),
                  this.calendarService.addWorklog(thirdEvent))
                  .subscribe(([first, second, third]) => {
                    if (first.message.length && second.message.length && third.message.length) {
                      this.getWorklogs();
                    }
                  });
  }

  eventDeleteClick(e: any): void {
    const selectedEvent = this.calendarComponent.getApi().getEventById(e.target.callerId);

    if (selectedEvent.title === 'Pause') {
      const previous = this.calendarEvents.findIndex(i => moment(i.end).toISOString() === moment(selectedEvent.start).toISOString());
      const next = this.calendarEvents.findIndex(i => moment(i.start).toISOString() === moment(selectedEvent.end).toISOString());

      if (previous > -1  && next > -1) {
      const duration = moment(this.calendarEvents[next].end).diff(this.calendarEvents[next].start, 'hours');
      this.calendarEvents[previous].end = moment(this.calendarEvents[previous].end)
        .clone()
        .add(duration, 'hour').toISOString();

      combineLatest(this.calendarService.updateWorklog(this.calendarEvents[previous]),
      this.calendarService.removeWorklog(this.calendarEvents[next].id))
        .subscribe(([first, second]) => {
          if (first.message.length && second.message.length) {
            this.getWorklogs();
          }
        });
      }
    }
    this.calendarService.removeWorklog(selectedEvent.id)
    .subscribe((data) => {
      this.getWorklogs();
    });
  }

  private getSumOfPause(end: any): number {
    let result = 0;
    this.calendarEvents.forEach((eventInfo: EventInput) => {
      if (eventInfo.title === 'Pause') {
        if (this.isSameDate(eventInfo.end, end)) {
          result += moment(eventInfo.end).diff(eventInfo.start, 'hours');
        }
      }
    });
    return result;
  }

  private getSumOfWorkingHours(end: any): number {
    let result = 0;
    this.calendarEvents.forEach((eventInfo: EventInput) => {
      if (eventInfo.title !== 'Pause') {
        if (this.isSameDate(eventInfo.end, end)) {
          result += moment(eventInfo.end).diff(eventInfo.start, 'hours');
        }
      }
    });
    return result;
  }

  private isSameDate(firstDate, secondDate): boolean {
    const yy = moment(firstDate).year() === moment(secondDate).year();
    const mm = moment(firstDate).month() === moment(secondDate).month();
    const dd = moment(firstDate).date() === moment(secondDate).date();

    return yy && mm && dd;
  }
}
