var React = require('react');
var RepoSelector = require('./repository-selector');

var MainView = React.createClass({
    propTypes: {
        repoDir: React.PropTypes.shape({
            value: React.PropTypes.string.isRequired,
            isValid: React.PropTypes.bool.isRequired
        }).isRequired,
        onRepoChange: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func.isRequired
    },

    repoChange(dir) {
        this.props.onRepoChange(dir);
    },

    handleCloseClick() {
        console.log('close');
        this.props.onClose();
    },

    render: function() {
        return (
            <RepoSelector ref='repoDir' {...this.props.repoDir} onChange={this.repoChange}/>
        );
    }
});

module.exports = MainView;
