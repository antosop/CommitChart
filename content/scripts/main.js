var Doughnut = require('react-chartjs').Doughnut;
var _ = require('lodash');
var React = require('react');

var Contribution = React.createClass({
    render: function() {
        return <Doughnut data={this.state.data} />;
    },
    getInitialState: function() {
        setInterval(this.getData(), 5000);
        return {
            colors: [
                ['#FF0000', '#FF4444'],
                ['#888800', '#CCCC44'],
                ['#00FF00', '#44FF44'],
                ['#008888', '#44CCCC'],
                ['#0000FF', '#4444FF'],
                ['#880088', '#CC44CC']
            ],
            data: {}
        };
    },
    getData: function(){
        $.getJSON('data', function(data){
            this.setState({
                data: _.map(data, function(item, index){
                    return {
                        label: item.name,
                        value: item.count,
                        color: this.state.colors[index][0],
                        highlight: this.state.colors[index][1]
                    };
                })
            });
        });
    }
});

React.render(<Contribution/>, document.getElementById('mainContainer'));
