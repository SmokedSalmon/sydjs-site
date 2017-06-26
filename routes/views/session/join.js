
/*
 * View Model for the Join Us page
 * A view to present recent links populated under different categories.
 * @req.params - tag: filter for link's tag?
 * @req.query  - sort: sort order of links
 * Renders "%view path%/session/join/"
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
	
	view.on('post', { action: 'join' }, function(next) {
		
		async.series([
			
                        // Check if all required fields are filled
			function(cb) {
				
				if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
					req.flash('error', 'Please enter a name, email and password.');
					return cb(true);
				}
				
				return cb();
				
			},
			
                        // Check if the email address is used
			function(cb) {
				
				keystone.list('User').model.findOne({ email: req.body.email }, function(err, user) {
					
					if (err || user) {
						req.flash('error', 'User already exists with that email address.');
						return cb(true);
					}
					
					return cb();
					
				});
				
			},
			
                        // Save the user data thus creating a new user of the site
			function(cb) {
			
				var userData = {
					name: {
						first: req.body.firstname,
						last: req.body.lastname,
					},
					email: req.body.email,
					password: req.body.password,
					
					website: req.body.website
				};
				
				var User = keystone.list('User').model,
					newUser = new User(userData);
				
				newUser.save(function(err) {
					return cb(err);
				});
			
			}
			
		], function(err){
			
			if (err) return next();
			
                        // Redirecion after a successful sign-up
			var onSuccess = function() {
				if (req.body.target && !/join|signin/.test(req.body.target)) {
					console.log('[join] - Set target as [' + req.body.target + '].');
					res.redirect(req.body.target);
				} else {
					res.redirect('/me');
				}
			}
			
			var onFail = function(e) {
				req.flash('error', 'There was a problem signing you in, please try again.');
				return next();
			}
			
			keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
			
		});
		
	});
	
	view.render('session/join');
	
}
