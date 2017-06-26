// Bind the Babel compiler tools/plugin using require method so that node can
// compile the specified files on the fly
// Load the babel-register plugin for the graphql directory
// Note this checks the regex against an absoloute path
// Files that do not match this regex will not be compiled
// In this project, this ES6 javaScript compiler is used mainly to support GraphQL
// for Node.js
require('babel-register')({ only: /\/graphql\/.*/ });

// Load .env config for development environments
require('dotenv').config({ silent: true });

// Initialise New Relic if an app name and license key exists
if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) {
	require('newrelic');
}

/**
 * Application Initialisation
 */

var keystone = require('keystone');
// import additional project meta data from package.json
var pkg = require('./package.json');

keystone.init({
        
        // Project options - branding
        // 'brand' displays at the top left corner of the Admin UI
	'name': 'SydJS',
	'brand': 'SydJS',
	'back': '/me',
        
        // Project options - path
	'favicon': 'public/favicon.ico',
	'less': 'public',
	'static': 'public',
        
        // Web server options
        // port, env not set, use Express default
        // logger, trust proxy, compress, less options can be further customized
        // ======
        // setting path of view templetes, which is required by keystone.View class
	'views': 'templates/views',
	'view engine': 'jade',
	'view cache': false,

	'emails': 'templates/emails',

        // Database and User Authentication settings
        // mongo database URI is either from the .env or localhost/<package.name>
	'auto update': true,
	'mongo': process.env.MONGO_URI || 'mongodb://localhost/' + pkg.name,

	'session': true,
	'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET || 'sydjs',

        // 3-party plug-in settings
	'mandrill api key': process.env.MANDRILL_KEY,

	'google api key': process.env.GOOGLE_BROWSER_KEY,
	'google server api key': process.env.GOOGLE_SERVER_KEY,

	'ga property': process.env.GA_PROPERTY,
	'ga domain': process.env.GA_DOMAIN,

	'basedir': __dirname
        
        // HTTPS server options: Not set yet

});

// similar to require('./models'), includes all .js file under the given path
keystone.import('models');

// Attach all routings to keystone
keystone.set('routes', require('./routes'));

// Setting local variables to pass to the view templates
keystone.set('locals', {
	_: require('lodash'),
	moment: require('moment'),
	js: 'javascript:;',
	env: keystone.get('env'),
	utils: keystone.utils,
	plural: keystone.utils.plural,
	editable: keystone.content.editable,
	google_api_key: keystone.get('google api key'),
	ga_property: keystone.get('ga property'),
	ga_domain: keystone.get('ga domain')
});

// Setting up variables for email service
keystone.set('email locals', {
	utils: keystone.utils,
	host: (function() {
		if (keystone.get('env') === 'staging') return 'http://sydjs-beta.herokuapp.com';
		if (keystone.get('env') === 'production') return 'http://www.sydjs.com';
		return (keystone.get('host') || 'http://localhost:') + (keystone.get('port') || '3000');
	})()
});

// Setting up navigation structure for the Admin UI
// the Key's values are models or array of models
// &&& each key's value can be further include an Array of list, to render a
// Secondary level of navigation
keystone.set('nav', {
	'meetups': ['meetups', 'talks', 'rsvps'],
	'members': ['users', 'organisations'],
	'posts': ['posts', 'post-categories', 'post-comments'],
	'links': ['links', 'link-tags', 'link-comments']
});

keystone.start();
