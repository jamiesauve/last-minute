const mongoose = require('mongoose');
const { User } = require('../../../models/User');

const updateHostedEventOnUser = async (user, event) => {

  const res = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        hostedEvents: user.hostedEvents.map((hostedEvent) => {
            if (hostedEvent._id.equals(event._id)) {
              hostedEvent = {
                _id: event._id,
                createdBy: event.createdBy,
                location: event.location,
                address: event.address,
                title: event.title,
                place: event.place,
                expiresAt: event.expiresAt,
                expiresAtHour: event.expiresAtHour,
                expiresAtMinute: event.expiresAtMinute,
                expiresAtAM: event.expiresAtAM,
                attendees: event.attendees,
                minimumPeople: event.minimumPeople,
                maximumPeople: event.maximumPeople,
                notes: event.notes,
              };
            }

            return hostedEvent;
        })
      }
    },
    { new: true }
  );

  let err = null;

  if (!res.name) err = "Update could not be completed. Please fire the system administrator.";

  return {err, res};
};

module.exports = { updateHostedEventOnUser };