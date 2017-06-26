/*
 * View Model for the Reset-password page
 * Verify password-resetting key(token), then handle the new password submition.
 * @req.params - key: validation token sent to user's email(or other security contact)
 *                  for the verification of user's identity
 * Renders "%view path%/session/reset-password/"
 */

var keystone = require('keystone'),
	User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
        // verify the password-resetting key presented by the person who issue the reset
	view.on('init', function(next) {
		
		User.model.findOne().where('resetPasswordKey', req.params.key).exec(function(err, user) {
			if (err) return next(err);
			if (!user) {
				req.flash('error', "Sorry, that reset password key isn't valid.");
				return res.redirect('/forgot-password');
			}
                        // pass the impending user to View Locals, whose password is
                        // ready to be changed
			locals.found = user;
			next();
		});
		
	});
	
        // The password-resetting key is verified, reset is approved, begin to handle
        // the new password
	view.on('post', { action: 'reset-password' }, function(next) {
		
		if (!req.body.password || !req.body.password_confirm) {
			req.flash('error', "Please enter, and confirm your new password.");
			return next();
		}
		
                // check if the tow passwords input by the user are matched
		if (req.body.password != req.body.password_confirm) {
			req.flash('error', 'Please make sure both passwords match.');
			return next();
		}
		
		locals.found.password = req.body.password;
		locals.found.resetPasswordKey = '';
		locals.found.save(function(err) {
			if (err) return next(err);
			req.flash('success', 'Your password has been reset, please sign in.');
			res.redirect('/signin');
		});
		
	});
	
	view.render('session/reset-password');
	
}
