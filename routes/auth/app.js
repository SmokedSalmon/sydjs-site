/*
 * View Model for the APP page
 * Takes the authenticated user info from the session and ???
 * Renders "%view path%/auth/app/"
 */

var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.authUser = req.session.auth;
	
	view.render('auth/app');
	
}
