/**
 * Meetup Routing
 * @param id   - the given meetup ID
 * @return rtn - a JSON container with all infomation of the specified meetup
 * Takes a meetup id parameter in the URL wild card, collect the correspondent
 * Meetup info, including all attendees' info (name, thumbnail), and RSVP info for
 * current user
 * 
 */

var _ = require('lodash');
var async = require('async');
var keystone = require('keystone');
var Meetup = keystone.list('Meetup');
var RSVP = keystone.list('RSVP');

exports = module.exports = function(req, res) {
        
        // meetupID is passed via path's URL parameters
	var meetupId = req.params.id;
        
        // Temparory container for retrieving meetup info
	var rtn = {
		meetup: {},
		attendees: [],
		rsvp: {
			exists: false,
			attending: false
		}
	};
        // async.series(tasks,callback):
        // run the tasks in series, interrupt upon any error in task and invoke callback
	async.series([
                
                // Retrieve the meetup from database
		function(next) {
			keystone.list('Meetup').model.findById(meetupId, function(err, meetup) {
				if (err) {
					console.log('Error finding meetup: ', err)
				}
				rtn.meetup = meetup;
				return next();
			});
		},
                
                // See if the current user has RSVP in this meetup
		function(next) {
			if (!rtn.meetup || !req.user) return next();
			keystone.list('RSVP').model.findOne()
				.where('who', req.user.id)
				.where('meetup', rtn.meetup.id)
				.exec(function(err, rsvp) {
					if (err) {
						console.log('Error finding current user RSVP', err);
					}
					if (rsvp) {
						rtn.rsvp.exists = true;
						rtn.rsvp.attending = rsvp.attending;
					}
					return next(err);
				});
		},
                
                // Retrieve all RSVP attendees' info(name, photo thumbnail(storage or
                // online avatar)). Only public attendees are collected
		function(next) {
			if (!rtn.meetup) return next();
			keystone.list('RSVP').model.find()
				.where('meetup', rtn.meetup.id)
				.where('attending', true)
                                // populate attendee's model into result since
                                // the "who" field is just _id reference
				.populate('who')
				.exec(function(err, results) {
					if (err) {
						console.log('Error loading attendee RSVPs', err);
					}
					if (results) {
						rtn.attendees = _.compact(results.map(function(rsvp) {
							if (!rsvp.who) return;
                                                        // return the attendee's
                                                        // url, photo thumbnail, etc
							return {
								url: rsvp.who.isPublic ? rsvp.who.url : false,
								photo: rsvp.who.photo.exists ? rsvp.who._.photo.thumbnail(80,80) : rsvp.who.avatarUrl || '/images/avatar.png',
								name: rsvp.name
							};
						}));
					}
					return next();
				});
		},

	], function(err) {
		if (err) {
			rtn.err = err;
		}
		res.json(rtn);
	});
}
