const mongoose = require('../mongoose.js');
const moment = require('moment');

const { Event } = require('../../models/Event.js');

const createEvent = async (event) => {

  console.log('event in db createEvent: ', event);

  const newEvent = new Event({
    createdBy: event.createdBy,
    location: event.location,
    address: event.address,
    title: event.title,
    place: event.place,
    createdAt: new moment().format(),
    expiresAt: event.expiresAt,
    expiresAtHour: event.expiresAtHour,
    expiresAtMinute: event.expiresAtMinute,
    expiresAtAM: event.expiresAtAM,
    attendees: [event.createdBy],
    minimumPeople: event.minimumPeople,
    maximumPeople: event.maximumPeople,
    notes: event.notes,
  });

  let res = newEvent;
  await newEvent.save((err) => {
    if (err) res = false;
    console.log(err);
  })
  console.log('result:', res);

  return res;
}

module.exports = {
  createEvent
};