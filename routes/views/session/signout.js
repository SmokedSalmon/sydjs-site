/*
 * View Model for the sign-out action (No page needed)
 * signout the current user and redirect to home page, thus clearing related session.
 * Renders none
 */

var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'session';
	
	keystone.session.signout(req, res, function() {
		res.redirect('/');
	});
	
};
