/**
 *  @fileoverview
 *  PSO: Pub-Sub-Output
 *  a simple pub/sub output to replace opera.postError and allow developers to subscribe to the debug outputs they want
 *
 *  @author Mathieu 'p01' Henri, Opera Software ASA (p01@opera.com)
 *  @version 0.1
 */
var PSO = new function()
{
    var _msg            = [];
    var _sub            = {};
    var _pub            = {};
    var _emitDelay      = 500;
    var _emitSeperator  = new Array(100).join('_');
    var _emitter        = window.opera?opera.postError:window.console?console.log:alert;


    /*
     *  disable the original emitter
     */
    function _disabledEmitter(s)
    {
        try
        {
            throw new Error( 'Thou shall not use opera.postError or console.log but the PSO library\n \n'+s+'\n \n' );
        }
        catch( e )
        {
            _emitter( e );
        }
    }
    window.opera?opera.postError=_disabledEmitter:window.console?console.log=_disabledEmitter:{}


    /*
     *  getHeading
     */
    function _getHeading( id )
    {
        var now = new Date();
        return 'PSO'+ (_emitSeperator+id).slice(-_emitSeperator.length)+' // '+ now.toLocaleString() +'.'+ now.getMilliseconds();
    }


    /*
     *  publish a string
     *
     *  @param {String} id              id of the publisher.
     *  @param {String} str+            the strings to publish
     */
    this.pub    = function( id, str )
    {
        if( typeof(id)=='string' && typeof(str)=='string' )
        {
            if( id!=='new pub' && !_pub[id] && !_sub[id] && _sub['new pub'] )
            {
                //  announce the publisher once
                _msg.push( _getHeading( 'new pub' ) +'\n* '+id);
                _pub[id] = true;
            }
            if( _sub[id] )
            {
                //  push the message if the publisher is subscribed to
                _msg.push( _getHeading( id )+'\n'+arguments.slice(1).join('\n') );
            }
        }
    }


    /*
     *  subscribe to publisher(s)
     *
     *  @param {String} id*             id of the publishers to subscribe.
     */
    this.sub    = function( )
    {
        var tmp = [];
        for( var i=arguments.length; i--; )
        {
            var id  = arguments[i];
            if( typeof(id)=='string' && !_sub[id]  )
            {
                tmp.push( id );
                //  subscribe to a publication
                _sub[id] = true;
            }
        }
    }


    /*
     *  unsubscribe from publisher(s)
     *
     *  @param {String} id*             id of the publishers to unsubscribe from.
     */
    this.unsub  = function( id )
    {
        for( var i=arguments.length; i--; )
        {
            var id  = arguments[i];
            if( typeof(id)=='string' && _sub[id]  )
            {
                //  delete the subscription
                delete _sub[id];
            }
        }
    }

    /*
     *  emit the messages of the subscribed publications
     */
    function _emit()
    {
        if( _msg.length>0 )
        {
            var s = '\n \n';
            _emitter( s+_msg.join(s)+s );
            _msg = [];
        }
        setTimeout( function(){ _emit() }, _emitDelay );
    }
    _emit();
}();