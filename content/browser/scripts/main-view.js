var React = require('react');
var RepoSelector = require('./repository-selector');

var MainView = React.createClass({
    propTypes: {
        repo: React.PropTypes.shape({
            value: React.PropTypes.string.isRequired,
            isValid: React.PropTypes.bool.isRequired,
            branches: React.PropTypes.arrayOf(React.PropTypes.string),
            features: React.PropTypes.arrayOf(React.PropTypes.string),
            currentBranch: React.PropTypes.string,
            currentFeature: React.PropTypes.string
        }).isRequired,
        onRepoChange: React.PropTypes.func.isRequired,
        onBranchSelect: React.PropTypes.func.isRequired,
        onFeatureSelect: React.PropTypes.func.isRequired
    },

    repoChange(dir) {
        this.props.onRepoChange(dir);
    },

    render: function() {
        return (
            <RepoSelector
                ref='repo'
                {...this.props.repo}
                onChange={this.repoChange}
                onBranchSelect={this.props.onBranchSelect}
                onFeatureSelect={this.props.onFeatureSelect}/>
        );
    }
});

module.exports = MainView;
