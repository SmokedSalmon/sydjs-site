/*
 * User stauts page routing
 * Retrieve the last and next meetup, and user info regarding RSVP and Talks for
 * the next meetup
 */

var keystone = require('keystone'),
	async = require('async'),
	_ = require('lodash'),
	moment = require('moment'),
	crypto = require('crypto');

exports = module.exports = function(req, res) {
	
	var data = { meetups: {}, talks: {}, rsvp: {} };
	
        // retrieve the user status with givin ID in the request body
        // status includes: last and next Meetup, and the correspondent talks
        // RSVP for this user during the next Meetup
	async.series([
		function(next) {
			if (!req.body.user) return next();
			keystone.list('User').model.findById(req.body.user).exec(function(err, user) {
				if (err || !user) return next();
				data.user = user;
				return next();
			});
		},
		function(next) {
			keystone.list('Meetup').model.findOne()
				.where('state', 'past')
				.sort('-startDate')
				.exec(function(err, meetup) {
					data.meetups.last = meetup ? meetup.toJSON() : false;
					return next();
				});
		},
		function(next) {
			keystone.list('Meetup').model.findOne()
				.where('state', 'active')
				.sort('-startDate')
				.exec(function(err, meetup) {
					data.meetups.next = meetup ? meetup.toJSON() : false;
					return next();
				});
		},
		function(next) {
			if (!data.meetups.last) return next();
			keystone.list('Talk').model.find()
				.where('meetup', data.meetups.last)
				.populate('who')
				.sort('sortOrder')
				.exec(function(err, talks) {
					data.talks.last = talks && talks.length ? talks.map(function(i) {
						return i.toJSON();
					}) : false;
					return next();
				});
		},
		function(next) {
			if (!data.meetups.next) return next();
			keystone.list('Talk').model.find()
				.where('meetup', data.meetups.next)
				.populate('who')
				.sort('sortOrder')
				.exec(function(err, talks) {
					data.talks.next = talks && talks.length ? talks.map(function(i) {
						return i.toJSON();
					}) : false;
					return next();
				});
		},
		function(next) {
			if (!req.body.user) return next();
			if (!data.meetups.next) return next();
			keystone.list('RSVP').model.findOne()
				.where('who', data.user)
				.where('meetup', data.meetups.next)
				.exec(function(err, rsvp) {
					data.rsvp = rsvp;
					return next();
				});
		}
	], function(err) {
		// after retrieving all data, construct a data object to contain
                // them and pack it into the response
		var response = {
			success: true,
			config: {
				versions: { 
					compatibility: process.env.APP_COMPATIBILITY_VERSION,
					production: process.env.APP_PRODUCTION_VERSION
				},
				killSwitch: false
			},
			meetups: {
				last: false,
				next: false
			},
			rsvp: {
				responded: false,
				attending: false
			},
			user: false
		}
		
                // basic cryto for meetup infomation, for the use of crypting meetup data
                // in the response
		var parseMeetup = function(meetup, current) {
			var meetupData = {
				id: meetup._id,
				
				name: meetup.name,
				
				starts: meetup.startDate,
				ends: meetup.endDate,
				
				place: meetup.place,
				map: meetup.map,
				
				description: keystone.utils.cropString(keystone.utils.htmlToText(meetup.description), 250, '...', true),
				
				ticketsAvailable: meetup.rsvpsAvailable,
				ticketsRemaining: meetup.remainingRSVPs,
				
				talks: current ? data.talks.next : data.talks.last
			}
			meetupData.hash = crypto.createHash('md5').update(JSON.stringify(meetupData)).digest('hex');
			return meetupData;
		}
		
		if (data.meetups.last) {
			response.meetups.last = parseMeetup(data.meetups.last);
		}
		
		if (data.meetups.next && moment().isBefore(data.meetups.next.endDate)) {
			response.meetups.next = parseMeetup(data.meetups.next, true);
			if (data.user) {
				response.rsvp.responded = data.rsvp ? true : false;
				response.rsvp.attending = data.rsvp && data.rsvp.attending ? true : false;
				response.rsvp.date = data.rsvp ? data.rsvp.changedAt : false;
			}
		}
		
		if (data.user) {
			response.user = {
				date: new Date().getTime(),
				userId: data.user.id,
				name: {
					first: data.user.name.first,
					last: data.user.name.last,
					full: data.user.name.full
				},
				email: data.user.email,
				avatar: data.user.avatarUrl
			}
		}
		
		res.apiResponse(response);
		
	});
}
