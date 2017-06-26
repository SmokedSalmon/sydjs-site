/*
 * View Model for the sign-in page (email account)
 * Signin user with email account and password
 * Renders "%view path%/session/signin/"
 */

var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {
	
	if (req.user) {
		return res.redirect(req.cookies.target || '/me');
	}
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'session';
	locals.form = req.body;
	
        // handle signin using email address account and password
	view.on('post', { action: 'signin' }, function(next) {
		
		if (!req.body.email || !req.body.password) {
			req.flash('error', 'Please enter your username and password.');
			return next();
		}
		
                // Define the redirection for a successful signin
		var onSuccess = function() {
                        // If post-signin destination is given
			if (req.body.target && !/join|signin/.test(req.body.target)) {
				console.log('[signin] - Set target as [' + req.body.target + '].');
				res.redirect(req.body.target);
			// else redirect to user profile page
                        } else {
				res.redirect('/me');
			}
		}
		
		var onFail = function() {
			req.flash('error', 'Your username or password were incorrect, please try again.');
			return next();
		}
		
		keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
		
	});
	
	view.render('session/signin');
	
}
