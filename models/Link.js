var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Links Model
 * ===========
 * For Creating Models with Keystone's List concept, please refer to:
 * http://keystonejs.com/docs/database/#lists
 */

// Create the keystone List object - Link, with list options
var Link = new keystone.List('Link', {
	map: { name: 'label' },
	track: true,
	autokey: { path: 'slug', from: 'label', unique: true }
});

// Adds fields to this newly created Link
Link.add({
	label: { type: String, required: true, initial: true },
	href: { type: Types.Url, required: true, initial: true },
	description: { type: Types.Markdown, initial: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	tags: { type: Types.Relationship, ref: 'LinkTag', many: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true }
});


/**
 * Relationships
 * =============
 */

Link.relationship({ ref: 'LinkComment', refPath: 'link', path: 'comments' });


/**
 * Registration
 * ============
 */

Link.defaultColumns = 'label, href, author|20%, state|20%';
Link.register();
