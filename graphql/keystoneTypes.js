import {
	GraphQLInt,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';

// Defines a name object type for users' names wih first name, last name and full name.
export var name = new GraphQLObjectType({
	name: 'KeystoneName',
	fields: {
		first: {
			type: GraphQLString,
		},
		last: {
			type: GraphQLString,
		},
		full: {
			type: GraphQLString,
		},
	},
});

// Defines image object type for images which utilize the cloudinary service
export var cloudinaryImage = new GraphQLObjectType({
	name: 'KeystoneCloudinaryImage',
	fields: {
		public_id: {
			type: GraphQLString,
		},
		version: {
			type: GraphQLInt,
		},
		signature: {
			type: GraphQLString,
		},
		format: {
			type: GraphQLString,
		},
		resource_type: {
			type: GraphQLString,
		},
		url: {
			type: GraphQLString,
		},
		width: {
			type: GraphQLInt,
		},
		height: {
			type: GraphQLInt,
		},
		secure_url: {
			type: GraphQLString,
		},
	},
});

// Defines location object type, as the location field of user profile
export var location = new GraphQLObjectType({
	name: 'KeystoneLocation',
	fields: {
		name: {
			type: GraphQLString,
		},
		number: {
			type: GraphQLInt,
		},
		street1: {
			type: GraphQLString,
		},
		street2: {
			type: GraphQLString,
		},
		suburb: {
			type: GraphQLString,
		},
		state: {
			type: GraphQLString,
		},
		postcode: {
			type: GraphQLInt,
		},
		country: {
			type: GraphQLInt,
		},
		geo: {
			type: new GraphQLList(GraphQLString),
			description: 'An array [longitude, latitude]',
		},
	},
});

// A date query? type which takes a parameter - field
// => Arrow expression, if you don't understand, please refer to MDN document
// and ECMAScript 2015 standard.
// Parenthesize the brackets so that contents within {} is parsed as object literal
// instead of statesment/expressions.
export var date = (field) => ({
	type: GraphQLString,
	args: {
		format: {
			type: GraphQLString,
			description: 'A formated time using Moment.js tokens ' +
				'http://momentjs.com/docs/#/displaying/format/',
		},
	},
	resolve: (source, args) => {
		if (args.format) {
			return field.format(source, args.format);
		}
		return source.get(field.path);
	},
});

// A date query? type which takes a parameter - field
export var datetime = (field) => ({
	type: GraphQLString,
	args: {
		format: {
			type: GraphQLString,
			description: 'A formated datetime using Moment.js tokens ' +
				'http://momentjs.com/docs/#/displaying/format/',
		},
	},
	resolve: (source, args) => {
		if (args.format) {
			return field.format(source, args.format);
		}
		return source.get(field.path);
	},
});

// Defines link object type for links used in the website
export var link = new GraphQLObjectType({
	name: 'KeystoneLink',
	fields: {
		raw: {
			type: GraphQLString,
			description: 'The raw unformmated URL',
		},
		format: {
			type: GraphQLString,
			description: 'The URL after being passed through the `format Function` option',
		},
	},
});

// Defines markdown object type, md is the marked text, with html as the replaced
// html code.
export var markdown = new GraphQLObjectType({
	name: 'KeystoneMarkdown',
	fields: {
		md: {
			type: GraphQLString,
			description: 'source markdown text',
		},
		html: {
			type: GraphQLString,
			description: 'generated html code',
		},
	},
});

// The email query? type, gravatarUrl is yet to be understood
export var email = new GraphQLObjectType({
	name: 'KeystoneEmail',
	fields: {
		email: {
			type: GraphQLString,
		},
		gravatarUrl: {
			type: GraphQLString,
			args: {
				size: {
					type: GraphQLInt,
					defaultValue: 80,
					description: 'Size of images ranging from 1 to 2048 pixels, square',
				},
				defaultImage: {
					type: GraphQLString,
					defaultValue: 'identicon',
					description: 'default image url encoded href or one of the built ' +
						'in options: 404, mm, identicon, monsterid, wavatar, retro, blank',
				},
				rating: {
					type: GraphQLString,
					defaultValue: 'g',
					description: 'the rating of the image, either rating, g, pg, r or x',
				},
			},
			description: 'Protocol-less Gravatar image request URL',
			resolve: (source, args) =>
				source.gravatarUrl(args.size, args.defaultImage, args.rating),
		},
	},
});
