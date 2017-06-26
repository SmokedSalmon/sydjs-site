/*
 * A React component to display the RSVP infomation of a single meetup, and props
 * to change the RSVP and attending status for current logined user
 * It acquires the infomation on upcoming meetup and its RSVP for current logined user
 * from RSVPStore, then populate all the props according to the state. 
 */

var React = require('react');
var request = require('superagent');
var RSVPStore = require('../stores/RSVPStore');

var HeroApp = React.createClass({

	getInitialState: function() {
		return {
			user: SydJS.user,
			isBusy: false,
			isReady: RSVPStore.isLoaded(),
			meetup: RSVPStore.getMeetup(),
			rsvp: RSVPStore.getRSVP(),
		};
	},

	componentDidMount: function() {
		RSVPStore.addChangeListener(this.updateStateFromStore);
	},

	componentWillUnmount: function() {
		RSVPStore.removeChangeListener(this.updateStateFromStore);
	},

	updateStateFromStore: function() {
		this.setState({
			isBusy: RSVPStore.isBusy(),
			isReady: RSVPStore.isLoaded(),
			meetup: RSVPStore.getMeetup(),
			rsvp: RSVPStore.getRSVP(),
		});
	},
        
	toggleRSVP: function(attending) {
		RSVPStore.rsvp(attending);
	},
        
        // Button Title according to the user's current attending status upon this RSVP
	renderWelcome: function() {
		if (this.state.rsvp.attending) {
			return <h4 className="hero-button-title"><span className = "welcome-message">We have your RSVP</span></h4>
		} else {
			return <h4 className="hero-button-title">Are you coming? <br /> <span className="spots-left">{this.state.meetup.remainingRSVPs}<span className="text-thin"> spots left</span></span><br /></h4>
		}
	},

        // Attach <div> prop indication loading procedure
	renderLoading: function() {
		return (
			<div className="hero-button">
				<div className="alert alert-success mb-0 text-center">loading...</div>
			</div>
		);
	},

        // Attach <div> prop indicating "component is busy"
	renderBusy: function() {
		return (
			<div className="hero-button">
				<div className="alert alert-success mb-0 text-center">hold on...</div>
			</div>
		);
	},
        
        // Render button for user not yet has RSVP for this meetup
	renderRSVPButton: function() {
		return (
                        // the event handler needs its keyword "this" change to the whole component
                        // since it is passed to the <div> DOM and invoked by the DOM itself
			<div className="hero-button" onClick={this.toggleRSVP.bind(this, true)}>
				<a className="btn btn-primary btn-lg btn-block">
					RSVP Now (<span className="text-thin">{this.state.meetup.remainingRSVPs} spots left</span>)
				</a>
			</div>
		);
	},
        
        // Render RSVP toggle button for user who has RSVP fo this meetup
	renderRSVPToggle: function() {
                // On/off style for the toggle button upon current user's attending status
		var attending = this.state.rsvp.attending ?  ' btn-success btn-default active' : null;
		var notAttending = this.state.rsvp.attending ? null : ' btn-danger btn-default active';
		return (
			<div>
				{this.renderWelcome()}
				<div className="hero-button">
					<div id="next-meetup" data-id={this.state.meetup._id} className="form-row meetup-toggle">
						<div className="col-xs-8">
							<button type="button" onClick={this.toggleRSVP.bind(this, true)} className={"btn btn-lg btn-block btn-default js-rsvp-attending " + attending}>
								<span>You're coming!</span>
							</button>
						</div>
						<div className="col-xs-4">
							<button type="button" onClick={this.toggleRSVP.bind(this, false)} className={"btn btn-lg btn-block btn-default btn-decline js-rsvp-decline " + notAttending}>Can't make it?</button>
						</div>
					</div>
				</div>
			</div>
		);
	},

	// MAKESHIFT WAY TO EXPOSE JQUERY AUTH LOGIC TO REACT
	signinModalTrigger: function (e) {
		e.preventDefault;
		window.signinModalTrigger(e);
	},

        // Render a button for signin purpose if no user is detected
	renderRSVPSignin: function() {
		return (
			<div className="hero-button">
				<a className="btn btn-primary btn-lg btn-block js-auth-trigger" onClick={this.signinModalTrigger}>RSVP Now <span className="text-thin">({this.state.meetup.remainingRSVPs} spots left)</span></a>
			</div>
		);
	},

	renderNoMoreTickets: function() {
		return (
			<div className="hero-button">
				<div className="alert alert-success mb-0 text-center">No more tickets...</div>
			</div>
		);
	},

	render: function() {
		if (!this.state.isReady) {
			return this.renderLoading();
		}
		if (this.state.isBusy) {
			return this.renderBusy();
		}

		var hasUser = !!this.state.user;
		var isRsvpOpen = this.state.meetup.rsvpsAvailable;
		var hasRsvped = this.state.rsvp.exists;
		var isAttending = this.state.rsvp.attending;

		if (!isRsvpOpen) {
			return hasUser && isAttending ? this.renderRSVPToggle() : this.renderNoMoreTickets();
		} else if (hasUser) {
			return hasRsvped ? this.renderRSVPToggle() : this.renderRSVPButton();
		} else {
			return this.renderRSVPSignin();
		}
	},
});

module.exports = HeroApp;
