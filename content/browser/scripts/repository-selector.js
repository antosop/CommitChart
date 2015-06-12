var React = require('react');
var B = require('react-bootstrap');
var _ = require('lodash');

var RepoSelector = React.createClass({
    propTypes: {
        value: React.PropTypes.string.isRequired,
        isValid: React.PropTypes.bool.isRequired,
        branches: React.PropTypes.arrayOf(React.PropTypes.string),
        features: React.PropTypes.arrayOf(React.PropTypes.string),
        currentBranch: React.PropTypes.string,
        currentFeature: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        onBranchSelect: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            value: this.props.value,
            currentBranch: this.props.currentBranch,
            currentFeature: this.props.currentFeature
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            currentBranch: nextProps.currentBranch,
            currentFeature: nextProps.currentFeature
        });
    },

    handleChange() {
        this.setState({value: this.refs.input.getValue()});
        this.props.onChange(this.refs.input.getValue());
    },

    handleBranchSelect(key) {
        this.setState({currentBranch: key});
        this.props.onBranchSelect(key);
    },

    handleFeatureSelect(key) {
        this.setState({currentFeature: key});
        this.props.onFeatureSelect(key);
    },

    render() {
        var branchDropdown;
        var featureDropdown;
        if (this.props.isValid){
            branchDropdown = (
                <B.DropdownButton title={this.state.currentBranch}>
                {
                    _.map(this.props.branches, (v) => {
                        return (
                            <B.MenuItem
                                eventKey={v}
                                className={v === this.state.currentBranch ? 'active' : ''}
                                active={v === this.state.currentBranch}
                                onSelect={this.handleBranchSelect}>
                                {v}
                            </B.MenuItem>
                        );
                    })
                }
                </B.DropdownButton>
           );
           var featureList = _.map(this.props.features, (v) => {
               return (
                   <B.MenuItem
                        eventKey={v}
                        className={v === this.state.currentFeature ? 'active' : ''}
                        onSelect={this.handleFeatureSelect}>
                        {v}
                    </B.MenuItem>
               );
           });
           featureList.unshift(
                <B.MenuItem
                    eventKey={this.state.currentBranch}
                    className={(!this.state.currentFeature) ? 'active' : ''}
                    onSelect={this.handleBranchSelect}>
                    none
                </B.MenuItem>
           );
           featureDropdown = (
               <B.DropdownButton title={this.state.currentFeature || 'none'}>
               { featureList }
               </B.DropdownButton>
           );
        } else {
            branchDropdown = <B.DropdownButton title="default" disabled/>;
            featureDropdown = <B.DropdownButton title="none" disabled/>;
        }

        return (
            <div>
                <B.Input
                    type='text'
                    label='Repository'
                    value={this.state.value}
                    bsStyle={this.props.isValid ? 'success' : 'error'}
                    hasFeedback
                    placeholder='Enter Repo Directory'
                    ref='input'
                    onChange={this.handleChange}
                    />
                <div id='branchSelector' className="selector"> Branch: {branchDropdown} </div>
                <div id='featureSelector'className="selector"> Feature: {featureDropdown} </div>
            </div>
        );
    }
});

module.exports = RepoSelector;
