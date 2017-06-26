var async = require('async');
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Posts Model
 * ===========
 */

var Post = new keystone.List('Post', {
        // ???map each itme's key to its title 
	map: { name: 'title' },
	track: true,
        // Post List's autokey are stored in a dedicated path 'slug'
	autokey: { path: 'slug', from: 'title', unique: true }
});

Post.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true }
});

/**
 * Virtuals
 * ========
 */

// Combine 'content.brief' and 'content.extended' into full content format
Post.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});


/**
 * Relationships
 * =============
 */

Post.relationship({ ref: 'PostComment', refPath: 'post', path: 'comments' });


/**
 * Notifications
 * =============
 */

Post.schema.methods.notifyAdmins = function(callback) {
	var post = this;
	// Method to send the notification email after data has been loaded
	var sendEmail = function(err, results) {
		if (err) return callback(err);
		async.each(results.admins, function(admin, done) {
			new keystone.Email('admin-notification-new-post').send({
				admin: admin.name.first || admin.name.full,
				author: results.author ? results.author.name.full : 'Somebody',
				title: post.title,
				keystoneURL: 'http://www.sydjs.com/keystone/post/' + post.id,
				subject: 'New Post to SydJS'
			}, {
				to: admin,
				from: {
					name: 'SydJS',
					email: 'contact@sydjs.com'
				}
			}, done);
		}, callback);
	}
	// Query data in parallel
        // Author of the new post and all admins will be notified by email
        // The emails will be sent asynchronoully by async module.
	async.parallel({
                // Query for the model item of the current author to process given method 'next'
		author: function(next) {
			if (!post.author) return next();
			keystone.list('User').model.findById(post.author).exec(next);
		},
                // Query for the model item of all admins to process given method 'next'
		admins: function(next) {
			keystone.list('User').model.find().where('isAdmin', true).exec(next)
		}
        // define 'sendEmail' as the 'next' action used above
	}, sendEmail);
};


/**
 * Registration
 * ============
 */

Post.defaultSort = '-publishedDate';
Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
