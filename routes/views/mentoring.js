/* View Model for the Mentoring page
 * Looks unfinished... come back at future versions
 * Renders "%view path%/site/mentoring/"
 */

var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'mentoring';
	
	view.render('site/mentoring');
	
}
