/*
 * View Model for the Link page
 * @req.params - link: an unique key as a path for user to get to this Link page
 * Load the specified Link and comment into View Locals, and handles the comment
 * creation
 * Renders "%view path%/site/link/"
 */

var keystone = require('keystone');

var Link = keystone.list('Link'),
	LinkComment = keystone.list('LinkComment');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	// Init locals
	locals.section = 'links';
	locals.filters = {
		link: req.params.link
	};
	
	view.on('init', function(next) {

		Link.model.findOne()
			.where('state', 'published')
			.where('slug', locals.filters.link)
			.populate('author categories')
			.exec(function(err, link) {
				if (err) return res.err(err);
				if (!link) return res.notfound('Link not found');
				locals.link = link;
				locals.link.populateRelated('comments[author]', next);
			});

	});
	
        // When a REST post is issued in this route, with a form contained 'create-comment'
        // the following function will be executed.
        // Creating a comment for the link
	view.on('post', { action: 'create-comment' }, function(next) {

		// handle form
		var newLinkComment = new LinkComment.model({
				link: locals.link.id,
				author: locals.user.id
			}),
			updater = newLinkComment.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your comment:'
			});
			
		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'content'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
                                // injects flash message in to request body, and
                                // redirect directive into response body and release
                                // them back to the pipeline
				req.flash('success', 'Your comment has been added successfully.');
				return res.redirect('/links/link/' + locals.link.slug);
			}
			next();
		});

	});
	
	// Render the view
	view.render('site/link');
	
}
