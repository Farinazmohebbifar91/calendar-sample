const express = require("express");
const bodyParser = require("body-parser");
const moment = require('moment');

const app = express();
const worklogs = [];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

app.get("/api/worklogs", (req, res) => {
 if(!this.worklogs){
  this.worklogs = [
    {
      id: 'Event_0',
      title: 'Event 0',
      start: moment(req.query.startDate).hour(8).toISOString(),
      end: moment(req.query.startDate).hour(10).toISOString()
    },
    {
      id: 'Event_1',
      title: 'projekt',
      start: moment().hour(8).minute(0).second(0).toISOString(),
      end: moment().hour(16).minute(0).second(0).toISOString()
    },
    {
      id: 'Event_2',
      title: 'Event_2',
      start: moment().add(1,'day').hour(9).minute(0).second(0).toISOString(),
      end:  moment().add(1,'day').hour(11).minute(0).second(0).toISOString()
    },
    {
      id: 'Event_3',
      title: 'Event 3',
      start: moment().add(2,'day').hour(9).minute(0).second(0).toISOString(),
      end:  moment().add(2,'day').hour(16).minute(0).second(0).toISOString()
    }
  ];
}
  res.status(200).json(this.worklogs);
});

app.put("/api/worklogs/:id", (req, res) => {
  const current=this.worklogs.findIndex(i => i.id === req.params.id);
  this.worklogs.splice(current, 1);
  this.worklogs.push(req.body);
  res.status(201).json({
    message: 'worklog added successfully'
  });
});

app.post("/api/worklogs", (req, res) => {
  this.worklogs.push(req.body);

  res.status(201).json({
    message: 'worklog added successfully'
  });
});

app.delete("/api/worklogs/:id", (req, res) => {
  const current=this.worklogs.findIndex(i => i.id === req.params.id);
  this.worklogs.splice(current, 1);

  res.status(201).json({
    message: 'worklog was delete'
  });
});

module.exports = app;
