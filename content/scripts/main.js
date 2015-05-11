//var Doughnut = require('react-chartjs').Pie;
var _ = require('lodash');
//var React = require('react');

var Notify = require('notifyjs');
var notifications = {};

Notify.requestPermission(function(){
    var es = new EventSource('/sse');
    es.onerror = function (arg1) {
        console.log(arg1);
    };
    es.addEventListener('recent', function(e){
        var data = JSON.parse(e.data);
        _.forEach(data, function(value, key){
            new Notify(value.length + ' new commits from ' + key, {body: _.map(value, function(v,i){
                    return (i + 1) + ' - ' + v;
            }).join('\n'), timeout: 10, icon: '/check-in.png'}).show();
        });
        //var recentNotification = new Notify('Recent', {body: e.data, timeout: 4});
        //recentNotification.show();
        console.log(e.data);
    }, false);
});

//var Contribution = React.createClass({
    //render: function() {
        //return <Doughnut data={this.state.data} width="500" height="500"/>;
    //},
    //getInitialState: function() {
        //setInterval(this.getData, 5000);
        //return {
            //colors: [
                //['#FF0000', '#FF4444'],
                //['#888800', '#CCCC44'],
                //['#00FF00', '#44FF44'],
                //['#008888', '#44CCCC'],
                //['#0000FF', '#4444FF'],
                //['#880088', '#CC44CC'],
                //['#555555', '#888888'],
                //['#FF0000', '#FF4444'],
                //['#888800', '#CCCC44'],
                //['#00FF00', '#44FF44'],
                //['#008888', '#44CCCC'],
                //['#0000FF', '#4444FF'],
                //['#880088', '#CC44CC'],
                //['#555555', '#888888']
            //],
            //data: {}
        //};
    //},
    //getData: function(){
        //var that = this;
        //jQuery.getJSON('data', function(data){
            //that.setState({
                //data: _.map(data, function(item, index){
                    //return {
                        //label: item.name,
                        //value: item.count,
                        //color: that.state.colors[index][0],
                        //highlight: that.state.colors[index][1]
                    //};
                //})
            //});
        //});
    //}
//});

//React.render(<Contribution/>, document.getElementById('mainContainer'));
