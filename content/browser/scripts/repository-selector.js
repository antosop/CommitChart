var React = require('react');
var Bootstrap = require('react-bootstrap');

var RepoSelector = React.createClass({
    propTypes: {
        value: React.PropTypes.string.isRequired,
        isValid: React.PropTypes.bool.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return { value: this.props.value };
    },

    componentWillRecieveProps(nextProps) {
        this.setState({value: nextProps.value});
    },

    handleChange() {
        this.setState({value: this.refs.input.getValue()});
        this.props.onChange(this.refs.input.getValue());
    },

    render() {
        return (
            <Bootstrap.Input
                type='text'
                value={this.state.value}
                bsStyle={this.props.isValid ? 'success' : 'error'}
                hasFeedback
                //label='Repository'
                placeholder='Enter Repo Directory'
                ref='input'
                onChange={this.handleChange}/>
        );
    }
});

module.exports = RepoSelector;
