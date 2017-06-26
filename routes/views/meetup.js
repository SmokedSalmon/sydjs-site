/*
 * View Model for the Meetup page
 * @req.params - meetup: an unique key as a path for user to get to this meetup page
 * Load the specified meetup info RSVP stauts for current user
 * Renders "%view path%/site/meetup/"
 */

var keystone = require('keystone'),
	moment = require('moment'),
	Meetup = keystone.list('Meetup'),
	RSVP = keystone.list('RSVP');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'meetups';
	locals.page.title = 'Meetups - SydJS';
	
	locals.rsvpStatus = {};
	
	
	// LOAD the Meetup
	
	view.on('init', function(next) {
		Meetup.model.findOne()
			.where('key', req.params.meetup)
			.exec(function(err, meetup) {
				
				if (err) return res.err(err);
				if (!meetup) return res.notfound('Post not found');
				
				locals.meetup = meetup;
				locals.meetup.populateRelated('talks[who] rsvps[who]', next);
				
			});
	});
	
	
	// LOAD an RSVP
	
	view.on('init', function(next) {
	
		if (!req.user || !locals.meetup) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('meetup', locals.meetup)
			.exec(function(err, rsvp) {
				locals.rsvpStatus = {
					rsvped: rsvp ? true : false,
					attending: rsvp && rsvp.attending ? true : false
				}
				return next();
			});
			
	});
	
	
	view.render('site/meetup');
	
}
