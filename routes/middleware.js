var _ = require('lodash');
// good old querystring module for all engine. Ceased updating at 2013
var querystring = require('querystring');
var keystone = require('keystone');


/**
	Initialises the standard view locals
*/

exports.initLocals = function(req, res, next) {

	var locals = res.locals;
        
        // navLinks, contains Objects each is a label-key-href value group
	locals.navLinks = [
		{ label: 'Home',			key: 'home',		href: '/' },
		{ label: 'Code of Conduct',	key: 'about',		href: '/about#CoC' },
		{ label: 'Meetups',			key: 'meetups',		href: '/meetups' },
		{ label: 'Members',			key: 'members',		href: '/members' },
		{ label: 'Showbag',			key: 'showbag',		href: '/showbag' }
	];
        
        // pass user object to view locals (if there is)
	locals.user = req.user;
        
        // baseDir
	locals.basedir = keystone.get('basedir');

        // Page url without query string, for redirecting purposes
	locals.page = {
		title: 'SydJS',
		path: req.url.split("?")[0] // strip the query - handy for redirecting back to the page
	};

        // inject a reference of a querryString value setting method into the view locals
	locals.qs_set = qs_set(req, res);
        
        // ??? refresh cookies?
	if (req.cookies.target && req.cookies.target === locals.page.path) res.clearCookie('target');

        // Browser vendor and version detection, 3rdparty library
	var bowser = require('../lib/node-bowser').detect(req);

        // client OS platform detection, given by client's browser
	locals.system = {
		mobile: bowser.mobile,
		ios: bowser.ios,
		iphone: bowser.iphone,
		ipad: bowser.ipad,
		android: bowser.android
	}

	next();

};


/**
	Make sponsors universally available
*/

exports.loadSponsors = function(req, res, next) {
	keystone.list('Organisation').model.find().sort('name').exec(function(err, sponsors) {
		if (err) return next(err);
		req.sponsors = sponsors;
		res.locals.sponsors = sponsors;
		next();
	});
}


/**
	Inits the error handler functions into `req`
*/

exports.initErrorHandlers = function(req, res, next) {
	res.err = function(err, title, message) {
		res.status(500).render('errors/500', {
			err: err,
			errorTitle: title,
			errorMsg: message
		});
	}
	res.notfound = function(title, message) {
		res.status(404).render('errors/404', {
			errorTitle: title,
			errorMsg: message
		});
	}
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
        Implemented via keystone.pre('render', ...) method
*/

exports.flashMessages = function(req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length }) ? flashMessages : false;
	next();
};

/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/signin');
	} else {
		next();
	}
}

/**
	Returns a closure that can be used within views to change a parameter in the query string
	while preserving the rest.
*/

var qs_set = exports.qs_set = function(req, res) {
	return function qs_set(obj) {
                // clone to whole querystring data object, not just the reference!!!
		var params = _.clone(req.query);
		for (var i in obj) {
			if (obj[i] === undefined || obj[i] === null) {
				delete params[i];
			} else if (obj.hasOwnProperty(i)) {
				params[i] = obj[i];
			}
		}
		var qs = querystring.stringify(params);
		return req.path + (qs ? '?' + qs : '');
	}
}
