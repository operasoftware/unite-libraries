/**
 * Copyright (c) 2009, Opera Software ASA
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Opera Software ASA nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA AND CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA AND CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


/*
 *  the PSO library is loaded: let's use it to filter the debug output
 */
switch( opera.io.webserver.userName )
{
    case 'p01':
    {
        PSO.sub
        (
//            '_getSessionId', 'headers'
//            'photoSharing.js','photosharing.js REST'
//            'Yusef.getSections', 'purgeAndSaveSessions',
//            'yusef public members', 'unlock', 'yusef request handle', 'Yusef.extend',
//            'Yusef.addPlugin','section listener', 'Yusef.addSectionListener',
//            'Yusef.plugins.acl infos','_accessTypes',
//            'Yusef.plugin.graphics',
//            'uniteAction' ,'_setupSession', '_getSessionId'
        );
        break;
    }

    case 'antonioafonso':
    {
        PSO.sub
        (
            'afonso', 'Yusef.plugins.ui', 'Yusef.plugins.acl'
        );
        break;
    }
    case 'gautamchandna':
    {
        PSO.sub
        (

        );
        break;
    }
}


/**
 * @fileoverview
 * Yusef : Unite Server Framework.
 *
 *
 * @author Mathieu 'p01' Henri, Opera Software ASA (p01@opera.com)
 * @author Antonio Afonso, Opera Software ASA (antonio.afonso@opera.com)
 * @version 1.0
 */

/**
 * This class has no public constructor.
 *
 * @class Yusef, The Unite Server Framework.
 */
var Yusef = new function()
{
    var self    = this;
    /**
     *  @constant
     *  @private
     */
    var _config = {};

    _config.maxNonces               = 100;
    _config.passwordLength          = 8;
    _config.sections                = {};
    _config.sections.static         = 'static';
    _config.sections.index          = '_index';
    _config.sections.error          = '_error';
    _config.serverScriptsPath       = '/serverScripts/';
    _config.sessionTTL              = 60000*30;     // 30 minutes TTL
    _config.sessionChangeTTL        = 1000*5;       // 5 seconds window to change an old session id
    _config.sessionRedirectArgument = 'session-redirect'; //  

    /**
     *  @private
     *  the prism between session cookie and session storage
     */
    var _sessionPrism               = {};
    /**
     *  @private
     *  the session storage
     */
    var _sessionData                = {};
    /**
     *  @private
     */
    var _changingYsid               = {};

    /**
     *  @private
     */
    var _sessions                   = {};
    /**
     *  @private
     */
    var _sections                   = {};
    /**
     *  @private
     */
    var _staticFiles                = {};
    /**
     *  @private
     */
    var _processUniteActionMethods  = {};







    /**
     *  Yusef's plugins namespace.
     *  <p><strong>Notice:</strong> Yusef plugins get an extend method from Yusef.addPlugin. Additionaly they get a path property which points to their location in the application mountpoint if their script was loaded by the LibraryLoader library.</p>
     *  <p>Yusef.getPluginsData( connection ) will call the getData( connection ) method of the plugins if they have one to retrieve some information about themselves and the connection.</p>
     *
     *  @namespace
     *
     *  @see #addPlugin
     *  @see #getPluginsData
     *  @see #extend
     */
    this.plugins                    = {};

    /**
     *  Yusef's public mountpoints. This class has no public constructor.
     *
     *  @namespace
     */
    this.mountpoints =
    {
        /**
         *  the application mountpoint.
         *  <p><strong>Recommendation:</strong> Developers can only read files here.</p>
         *
         *  @memberOf   Yusef.mountpoints
         */
        application:    opera.io.filesystem.mountSystemDirectory( 'application' ),
        /**
         *  the storage mountpoint.
         *  <p><strong>Recommendation:</strong> Developers can read and write files here.</p>
         *
         *  @memberOf   Yusef.mountpoints
         */
        storage:        opera.io.filesystem.mountSystemDirectory( 'storage' ),
        /**
         *  the shared mountpoint.
         *  <p><strong>Recommendation:</strong> Developers should only read files from here.</p>
         *
         *  @memberOf   Yusef.mountpoints
         */
        shared:         opera.io.filesystem.mountSystemDirectory( 'shared' )
    };


    /**
     *  set a cookie
     *
     *  @memberOf WebServerResponse
     *  @param  key
     *  @param  value
     */
    WebServerResponse.prototype.setCookie = function( key, value )
    {
        this.setResponseHeader( 'Set-Cookie', escape(key) +'='+ escape(value) );
    }


    /**
     *  get a cookie
     *
     *  @memberOf  WebServerRequest
     *  @param  key
     */
    WebServerRequest.prototype.getCookie = function( key )
    {
        // NOTE: it's disregarding this bit of the RFC:
        //       A server SHOULD also accept comma (,) as the separator
        //       between cookie-values for future compatibility.
        var regexp = new RegExp( '(?:^|;\\s*?)'+ key.replace(/\$/g, '\\$') + '=("([^"]*)"|[^";]+)(;|$)' );

        if( "undefined"!=typeof(this.headers.Cookie) )
        {
            for( var i=0;i<this.headers.Cookie.length; i++ )
            {
                if( this.headers.Cookie[i].match( regexp ) )
                {
                    return RegExp.$2 || RegExp.$1;
                }
            }
        }
        return null;
    }


    /**
     *  @private
     *  @param dir
     *  @param exposedPath
     *  @param rootPath
     */
    function _shareDirectory( dir, exposedPath, rootPath )
    {
        var exposedPath = exposedPath||'';
        var rootPath = rootPath||dir.path+'/';
        dir.refresh();

        for( var i = 0, file; file = dir[i]; i++ )
        {
            if( file.path[file.path.lastIndexOf('/')+1]==='.' )
            {
                continue;
            }
            if( file.isDirectory )
            {
                _shareDirectory( file, exposedPath, rootPath );
            }
            else if( file.isFile )
            {
                var path = file.path.slice( rootPath.length );
                if( !(_config.sections.static+path in _staticFiles) )
                {
                    opera.io.webserver.sharePath( _config.sections.static+'/'+exposedPath+path, file );
                }
            }
        }
    }


    /**
     *  Expose a File object on the "static" section.
     *
     *  @param  {File} file   The file object to share.
     *  @param  {String}    exposedPath     Optional. The path on which to share file in the static section.
     *
     *  @see #addSectionListener
     *
     *  @example
     *  //  Expose the content of application://static_files/assets/images/ under /static/img/
     *
     *  var dir = Yusef.mountpoints.application.resolve( 'static_files/assets/images/' );
     *  Yusef.shareStaticDirectory( dir, 'img/' );
     *
     *  @example
     *  // Expose the library Activity Stream ( example using the LibraryLoader library ) under /static/libraries/activityStream
     *
     *  var dir = Yusef.mountpoints.application.resolve( Libraries.list.activityStream.path );
     *  Yusef.shareStaticDirectory( dir, 'libraries/activityStream/' );
     */
    this.shareStaticDirectory = function( fileObject, exposedPath )
    {
        var exposedPath = exposedPath||'';
        _shareDirectory( fileObject, exposedPath );
    }


    /**
     * Share files under /public_html/
     *
     *  @private
     */
    function _sharePublicFiles()
    {
        // Application's public_html
        var public_html = self.mountpoints.application.resolve( '/public_html/' );
        self.shareStaticDirectory( public_html );
    }


    /**
     *  Serve a file with the correct headers.
     *
     *  @param  {WebServerConnection}    connection
     *  @param  {File}    file  The file to serve.
     *  @param  {String}    contentType    Optional. The content type of the file.
     *
     *  @example
     *  // Serve a file as is
     *
     *  var file = Yusef.mountpoints.application.resolve( 'config.xml' );
     *  Yusef.serveFile( connection, file );
     *
     *  @example
     *  // Serve a file for download
     *
     *  var file = Yusef.mountpoints.application.resolve( 'index.html' );
     *  Yusef.serveFile( connection, file, 'application/octet-stream' );
     *
     *  @example
     *  // Serve a file for download under another filename
     *
     *  var file = Yusef.mountpoints.application.resolve( 'index.html' );
     *  connection.response.setResponseHeader( 'Content-Disposition', 'inline; filename=source.txt' );
     *  Yusef.serveFile( connection, file, 'application/octet-stream' );
     */
    this.serveFile = function( connection, file, mimeType )
    {
        if( !connection.closed && file.exists && file.isFile )
        {
            var uri     = connection.request.uri.replace( /\?.*/g, '' );
            var path    = uri.slice( opera.io.webserver.currentServicePath.length );
            
            if( typeof(mimeType)=='string' && mimeType.match( /^[a-z0-9!#\$\.\+\-\^_]{1,127}\/[a-z0-9!#\$\.\+\-\^_]{1,127}$/i )!==null )
            {   //  check that the optional mimeType argument matches the RFC 4288
                connection.response.setResponseHeader( 'Content-Type', mimeType );
                if( mimeType==='application/octet-stream' )
                {
                    connection.response.setResponseHeader( 'Content-disposition', 'attachment' );
                }
            }

            opera.io.webserver.sharePath( path, file );
            connection.request.uri  = uri;
            connection.response.closeAndRedispatch();
            opera.io.webserver.unsharePath( path );
            return true;
        };
        return false;
    }


    /**
     *  @private
     */
    function _isValidSection( section )
    {
        return typeof(section)==='string' && _sections[section]!==undefined && typeof(_sections[section].listener)==='function';
    }


    /**
     *  Return the list of sections and their listener.
     *
     *  @return {Object}    A hash map with the name of the sections in key and the associated listener in value.
     *
     *  @see #addSectionListener
     */
    this.getSections = function()
    {
        PSO.pub( 'Yusef.getSections', _enumerateObject( _sections, '_sections' ) );
        return _copyObject( _sections );
    }


    /**
     *  Add a listener method for a given section.
     *  <p>Yusef.addSectionListener is the entry point for your Unite application. It will allow it to listen to all the requests made to the subpath "name" of your application.</p>
     *  <p><strong>Notice:</strong> Yusef adds the listener for the "static" section which serves the content of the "public_html" folder of the application mountpoint.</p>
     *  <p>The connection object is augmented with some properties such as sessionId, session, session.nonce, request.path, request.section, request.sectionName,
     *
     *  @param  {String}    name    The name of the section.
     *  @param  {Function}  method  The listener method.
     *
     *  @see #shareStaticDirectory
     *  @see #getSections
     *
     *  @example
     *  // Listen to the requests made in the "api" section of the application:
     *
     *  Yusef.addSectionListener
     *  (
     *      'api',
     *      function( connection )
     *      {
     *          var tmp = connection.request.path.split( '/' );
     *          var action = tmp[0]||'';
     *
     *          if( action==='localtime' )
     *          {
     *              return new Date().toLocaleString();
     *          }
     *          else if ( action==='randomnumber' )
     *          {
     *              return Math.random();
     *          }
     *
     *          return '** action not implemented **';
     *      }
     *  );
     *
     *  @example
     *  // Redirect the request made at the _index of the application to the "content" section
     *
     *  Yusef.addSectionListener
     *  (
     *      '_index',
     *      function( connection )
     *      {
     *          connection.response.setStatusCode( '302', 'Found' );
     *          connection.response.setResponseHeader( 'Location', 'content/' );
     *          connection.response.close();
     *      }
     *  );
     *
     */
    this.addSectionListener = function( section, method )
    {
        var section     = (''+section),
            success     = section===section.toLowerCase() && typeof(section)=='string' && _sections[section]===undefined && typeof(method)=='function' && ( section[0]!=='_' || (section.slice(1)) in _config.sections);

        if( success )
        {
            _sections[section] =
            {
                'listener'      :method
            }
        }
        PSO.pub( 'Yusef.addSectionListener', arguments.join('\n') +'\n--> '+ success );
        return success;
    }


    //  addSectionListener:  static
    this.addSectionListener
    (
        _config.sections.static,
        /**
         *  @inner
         */
        function sectionListener_static( connection )
        {
            return connection.response.closeAndRedispatch();
        }
    );


    /**
     *  Register a listener method for a UniteAction.
     *  <p><strong>Notice:</strong> The uniteAction will only be processed if it was posted with a valid cryptographic nonce.</p>
     *  <p>The uniteAction will be processed before the listener method of the section.</p>
     *  <p>The current cryptographic nonce is exposed to the section listeners on connection.session.nonce.</p>
     *  <p>The return value of "method" is exposed on connection.uniteActionData.</p>
     *
     *  @param  {String}    name    The name of the uniteAction.
     *  @param  {Function}  method  The method that will process the uniteAction.
     */
    this.registerUniteActionListener = function( uniteAction, method )
    {
        if( typeof(uniteAction)=='string' && typeof(_processUniteActionMethods[uniteAction])=='undefined' && typeof(method)=='function' )
        {
            PSO.pub( 'uniteAction', 'registered '+ uniteAction, method );
            _processUniteActionMethods[uniteAction] = method;
            return true;
        }
        return false;
    }


    /**
     *  @private
     *  @param  connection
     */
    function _processUniteAction( connection )
    {
        //  process unite-action
        if
        (
            connection.sessionId
            && connection.request.bodyItems['unite-action']
            && _sessionData[ connection.sessionId ]
            && connection.session.isValidNonce
        )
        {
            var uniteAction = connection.request.bodyItems['unite-action'][0];
            if( typeof( _processUniteActionMethods[uniteAction] )=='function' )
            {
                PSO.pub( 'uniteAction', uniteAction +'\n'+ _processUniteActionMethods[uniteAction] );
                return _processUniteActionMethods[uniteAction]( connection );
           }
        }
        return false;
    }


    /**
     *  Return the session storage id assigned to a connection.
     *
     *  @private
     *  @param  {WebServerConnection}   connection
     *
     *  @return {String}                ssid    the Session Storage Id.
     */
    function _getSessionId( connection )
    {
        //  this connection has a known ysid
        if( connection.ssid )
        {
            return connection.ssid;
        }


        //  this connection doesn't have a known ysid yet
        var now             = new Date().getTime();
        var redirectCauses  = [];
        var ua              = connection.request.headers['User-Agent'][0];
        var ip              = (connection.request.getRequestHeader( 'X-Forwarded-For' )||[''])[0];
        ip                  = connection.request.ip+(ip==''?'':','+ip);
        var cookieName      = 'ysid-'+ _hash( widget.identifier+'x'+ip+'x'+ua );
        var ysid            = connection.request.getCookie( cookieName )||'';
        var ysidBefore      = ysid;
        var extras          = [];


        //  the visitor has a ysid flagged as changed
        if( ysid && _changingYsid[ ysid ] )
        {
            extras.push( 'changing ysid from '+ ysid +' to '+ _changingYsid[ ysid ].ysid );
            ysid = _changingYsid[ ysid ].ysid;
        }

        //  the visitor has an unknown ysid
        //  --> null the ysid
        if( ysid && !_sessionPrism[ ysid ] )
        {
            extras.push( 'unknown ysid, flagging it for change in case of similar incoming requests' );
            ysid    = null;
        }

        //  the visitor has a ysid AND a conflicting ip OR expired session
        //  --> null the ysid and delete  sessionPrism and associated sessionData
        //  /!\ This will log out the visitor who had this ysid on another ip
        if( ysid && ( _sessionPrism[ ysid ].ip!==ip || _sessionPrism[ ysid ].ua!==ua || _sessionPrism[ ysid ].when<now-_config.sessionTTL ) )
        {
            extras.push( 'reset the ysid & session due to '+ (_sessionPrism[ ysid ].ip!==ip?'conflicting ip':_sessionPrism[ ysid ].ua!==ua?'conflicting ua':'expired session') );
            extras.push( _enumerateObject( _sessionPrism[ ysid ], '_sessionStorage[ '+ ysid +' ]' ) );

            redirectCauses.push( _sessionPrism[ ysid ].ip!==ip?'ipConlict':_sessionPrism[ ysid ].ua!==ua?'conflicting ua':'expired' );

            delete _sessionData[ _sessionPrism[ ysid ].ssid ];
            delete _sessionPrism[ ysid ];
            ysid    = null;
        }

        //  the visitor has a valid ysid and is about to process some POST data
        //  --> keep the ssid but null the ysid and delete the sessionPrism
        if( ysid && _sessionPrism[ ysid ] && _sessionPrism[ ysid ].ip==ip && _sessionPrism[ ysid ].ua==ua && connection.request.body )
        {
            extras.push( 'valid ysid & session about to process some POST data' );
            var ssid    = _sessionPrism[ ysid ].ssid;
            delete _sessionPrism[ ysid ];
            ysid        = null;
        }


        
        //  the visitor does not have a ysid [anymore]
        //  --> create a ysid and associated session
        if( !ysid )
        {
            do
            {
                ysid = _getUID();
            }
            while( _sessionPrism[ ysid ] );
            if( !ssid )
            {
                do
                {
                    var ssid = _getUID();
                }
                while( _sessionData[ ssid ] );
    
                _sessionData[ ssid ] =
                {
                    'nonce':'',
                    'nonces':[],
                    'storage':{}
                }
            }
            _sessionPrism[ ysid ] =
            {
                'ip':   ip,
                'ua':   ua,
                'ssid': ssid,
                'hit':  0
            };
        }

        //  the visitor now has a ysid
        connection.ssid = _sessionPrism[ ysid ].ssid;
        connection.response.setCookie( cookieName, ysid );
        _sessionPrism[ ysid ].when = now;
        _sessionPrism[ ysid ].hit++;



        //  flag the change of ysid in case of incoming request with it
        if( ysidBefore && ysidBefore!==ysid && !_changingYsid[ ysidBefore ] )
        {
            _changingYsid[ ysidBefore ] =
            {
                'ysid': ysid,
                'when': now
            }
        }

        //  the request did not have a ysid cookie
        //  --> reason to redirect
        if( !ysidBefore && !connection.request.queryItems.noCookie )
        {
            redirectCauses.push( 'noCookie' );
        }


        //  any reason to redirect ?
        //  --> redirect with the reason(s) in an extra HTTP header
        if( !connection.request.getItem( _config.sessionRedirectArgument, 'GET' ) && redirectCauses.length!==0 )
        {
            PSO.pub( '_getSessionId', 'no ysid cookie -> redirect with a "noCookie" header -> '+ ysid );
            connection.response.setStatusCode( '302', 'Found' );
            var uri = connection.request.uri;
            uri += (uri.indexOf('?')==-1?'?':'&')+ _config.sessionRedirectArgument +'='+ escape( redirectCauses.join(',') );
            connection.response.setResponseHeader( 'Location', uri );
            connection.response.close();
        }


        //  wipes
        //  _changingYsid
        //  _sessionPrism having a single hit after the sessionChangeTTL window
        //  _sessionData that are not in use any more
        var then    = now-_config.sessionChangeTTL;
        for( var k in _changingYsid )
        {
            if( _changingYsid[k].when<then )
            {
                delete _changingYsid[k];
            }
        }
        for( var k in _sessionPrism )
        {
            if( _sessionPrism[k].hit===1 && _sessionPrism[k].when<then )
            {
                delete _sessionPrism[k];
            }
            else if( _sessionData[ _sessionPrism[k].ssid ] )
            {
                _sessionData[ _sessionPrism[k].ssid ].inUse = true;
            }
        }
        for( var k in _sessionData )
        {
            if( !_sessionData[k].inUse )
            {
                delete _sessionData[k];
            }
            else
            {
                delete _sessionData[k].inUse;
            }
        }


        PSO.pub
        (
            '_getSessionId',
            ' ',
            connection.request.protocol+'://'+connection.request.headers.Host[0]+connection.request.uri,
            connection.request.headers['User-Agent'][0],
            ' ',
            'This connection: '+ connection.isOwner?'isOwner':connection.isLocal?'isLocal':connection.isProxied?'isProxied':'isDirect',
            'cookie name:\t'+ cookieName,
            'ysid then:\t'+ ysidBefore +(extras.length?'\t'+extras.join(', ' ):'' ),
            'ysid now:\t'+ ysid,
            'ssid:\t\t'+ _sessionPrism[ ysid ].ssid,
            ' ',
            _enumerateObject( _changingYsid, '_changingYsid' ),
            _enumerateObject( _sessionPrism, '_sessionPrism' ),
            _enumerateObject( _sessionData, '_sessionData' )
        );
        return connection.ssid;
    }


    /**
     *  @private
     *
     *  @param  {WebServerConnection}   connection
     */
    function _setupSession( connection )
    {
        var ssid = _getSessionId( connection );
        if( ssid )
        {
            var session = _sessionData[ ssid ];

            //  current nonce
            session.isValidNonce    = false;
            var currentNonce  = (connection.request.bodyItems['unite-nonce']||[])[0];
            if( currentNonce )
            {
                session.nonces.forEach
                (
                    /**
                     *  @inner
                     */
                    function isValidNonce()
                    {
                        if( arguments[0]==currentNonce )
                        {
                            session.isValidNonce    = true;
                            session.previousNonce   = currentNonce;
                            session.nonces.splice( arguments[1], 1 );
                        }
                    }
                );
            }
            
            //  push a new nonce
            session.nonce       = 'n-'+ _hash( widget.identifier+'x'+ssid+'x'+Math.random()+"x"+connection.request.uri );
            session.nonces.push( session.nonce );

            //  limit the number of nonces
            session.nonces      = session.nonces.slice( -_config.maxNonces );
            
            connection.session              = {};
            connection.session.id           = ''+ssid;
            connection.session.nonce        = ''+session.nonce;
            connection.session.isValidNonce = false||session.isValidNonce;
            connection.sessionId            = connection.session.id;

            PSO.pub( '_setupSession', connection.request.uri,_enumerateObject(connection.session) )
        }

    }


    /**
     *  Get a session variable.
     *
     *  @param  {WebServerConnection}   connection
     *  @param  {String}                key
     *
     *  @return {Mixed}   A copy of the session variable if available. Null otherwise.
     */
    this.getSessionVariable = function( connection, key )
    {
        var ssid    = _getSessionId( connection );
        if( typeof(key)=='string' && ssid && _sessionData[ ssid ].storage[ key ]  )
        {
            return _copyObject( _sessionData[ ssid ].storage[ key ] );
        }
        return null;
    }


    /**
     *  Set a session variable.
     *
     *  @param  {WebServerConnection}   connection
     *  @param  {String}                key
     *  @param  {String}                value
     *
     *  @return {Boolean}   True if the operation was succesful. False otherwise.
     */
    this.setSessionVariable = function( connection, key, value )
    {
        var ssid=_getSessionId( connection );
        if( typeof(key)=='string' && ssid && _sessionData[ ssid ] )
        {
            if( typeof(value)=='string' )
            {
                _sessionData[ ssid ].storage[ key ] = ''+value;
            }
            else
            {
                _sessionData[ ssid ].storage[ key ] = _copyObject( value );
            }
            return true;
        }
        return false;
    }


    /**
     *  Delete a session variable.
     *
     *  @param  {WebServerConnection}   connection
     *  @param  {String}                key
     *
     *  @return {Boolean}   True if the operation was succesful. False otherwise.
     */
    this.deleteSessionVariable = function( connection, key )
    {
        var ssid=_getSessionId( connection );
        if( typeof(key)=='string' && ssid && _sessionData[ ssid ] )
        {
            _sessionData[ ssid ].storage[ key ] = null;
            delete  _sessionData[ ssid ].storage[ key ];
            return true;
        }
        return false;
    }


    /**
     *  Emits an error page on the response and a 404 HTTP status code. This method is called when an invalid section is requested. Ideally application developers should use it to provide a consistent error page to the visitors.
     *  <p><strong>Notice:</strong> the "_error" section listener is called if there is one.</p>
     *
     *  @param {WebServerConnection}   connection
     *
     *  @see #getSections
     *  @see #addSectionListener
     */
    this.emitErrorPage = function( connection )
    {
        connection.response.setStatusCode( '404', 'Not Found' );

        var hasErrorSectionListener = _sections[ _config.sections.error ]!==undefined;
        if( hasErrorSectionListener )
        {
            var output = _sections[ _config.sections.error ].listener( connection );
        }
        else
        {
            var output = '<!doctype html>\n<style>\nbody{font:.8em/1.5em sans-serif;}\nh1{font-weight:normal;}\n</style>\n<h1>Resource not found in the '+ opera.io.webserver.currentServiceName.HTMLEntities() +' application</h1>\n<p>Try any of the following section(s):</p>\n<ul>';
            for( var sectionPath in _sections )
            {
                if( sectionPath[0]!=='_' )
                {
                    output += '\n\t<li><a href="'+ opera.io.webserver.currentServicePath+sectionPath +'">'+ sectionPath.HTMLEntities() +'</a></li>';
                }
            }
            output += '\n</ul>';
        }

        //  connection still active
        if( connection.closed===false && !connection.pending )
        {
            connection.response.write( output||'' );
            connection.response.close();
        }
    }


    /**
     *  _requestHandle
     *
     *  @param {event}   event
     *  @private
     */
    function _requestHandle( event )
    {
        var �=new Timer( 'yusef request handle' )
        �.t('_requestHandle');

        var connection      = event.connection;
        var output          = '';
        var tmp             = connection.request.uri.slice( opera.io.webserver.currentServicePath.length ).split('?')[0].split('/');

        connection.request.section      = tmp.length<1?'':tmp.shift().toLowerCase();
        connection.request.path         = '/'+tmp.join('/');
        connection.request.sectionName  = connection.request.section;


        //  _index request
        if( connection.request.section==='' )
        {
            connection.request.sectionName  = _config.sections.index;
        }


        //  invalid section --> emitErrorPage
        var validSection        = _isValidSection(connection.request.sectionName);
        var hasSectionListener  = _sections[connection.request.sectionName ]!==undefined;
        if( validSection && hasSectionListener )
        {
            �.t( '\n \n'+ connection.request.ip +' requested '+ connection.request.uri +'\n'+ connection.request.section +' -(sectionName)-> '+ connection.request.sectionName +'\n'+ connection.request.path +'\n \n'+ (validSection?_sections[connection.request.sectionName ].listener:'no listener') );

            //  /static/ request do not need _setupSession
            if( connection.request.sectionName!==_config.sections.static )
            {
                �.t('_setupSession');
                _setupSession( connection );
                �.t('_setupSession');
            }

            if( connection.closed===false )
            {
                //  /static/ request do not need _processUniteAction
                if( connection.request.sectionName!==_config.sections.static )
                {
                    �.t('_processUniteAction');
                    connection.uniteActionData  = _processUniteAction( connection );
                    �.t('_processUniteAction');
                }

                //  call the section listener or fallback to plain content
                �.t('sectionLisenter');
                output = _sections[connection.request.sectionName ].listener( connection );
                �.t('sectionLisenter');
            }
        }
        else
        {
            �.t('emitErrorPage');
            this.emitErrorPage( connection );
            �.t('emitErrorPage');
        }

        //  connection still active
        if( connection.closed===false && !connection.pending )
        {
            PSO.pub( 'yusef request handle', connection.request.ip +' requested '+ connection.request.uri +'\n-> '+ connection.request.section +'\n-> '+ connection.request.path +'\n \n=>'+ connection.request.sectionName +'\n \n'+ (validSection?_sections[connection.request.sectionName ].listener:'no listener') );

            �.t('response.write');
            connection.response.write( output||'' );
            �.t('response.write');
            connection.response.close();
        }

        �.output();
    }


    /**
     *  Load the .js files in _config.serverScriptsPath
     *
     *  @private
     */
    function _loadServerScripts()
    {
        var head = document.documentElement;
        var serverScripts = self.mountpoints.application.resolve( _config.serverScriptsPath );
        var scriptsCount    = 0;

        /**
         *  @inner
         */
        function scriptLoaded()
        {
            scriptsCount--;
            if( scriptsCount===0 )
            {
                opera.io.webserver.addEventListener( '_request', _requestHandle.bind( self ), false );
            }
        }

        serverScripts.refresh();
        for( var i=0,currentFile; currentFile=serverScripts[i]; i++ )
        {
            if( currentFile.isFile && !currentFile.isHidden
                && currentFile.name.match( /\.js$/ ) )
            {
                scriptsCount++;
                var script = document.createElement( 'script' );
                script.onload = scriptLoaded;
                script.setAttribute( 'src', currentFile.path.slice( self.mountpoints.application.path.length ) );
                document.documentElement.appendChild( script );
            }
        }
    }


    /**
     *  Retrieve data from the plugins about themselves and the current applicatio & connection
     *
     *  @param {WebServerConnection}   connection
     *  @return {Object}    a hash table with the name of the plugins in key and the data returned by the getData( connection ) method of the plugin
     *
     *  @see #plugins
     *  @see #addPlugin
     *  @see #getData
     */
    this.getPluginsData = function( connection )
    {
        var pluginsData = {};
        for( var id in this.plugins )
        {
            if( typeof( this.plugins[id].getData )==='function' )
            {
                pluginsData[id] = this.plugins[id].getData( connection );
            }
        }
        return pluginsData;
    }


    /**
     *  Return some data about the current application & connection.
     *
     *  @param  {WebServerConnection}   connection
     *  @param  {Boolean}   includePlugins     Optional. False by default. When true, the result of the Yusef.getPluginsData method will be added in the plugins property of the return value.
     *  @return {Object}
     *
     *  @see #getPluginsData
     *  @see #plugins
     */
    this.getData = function( connection, includePlugins )
    {
        var data = {};
        var includePlugins = includePlugins || false;

        data.originURL = opera.io.webserver.originURL;
        data.servicePath = opera.io.webserver.currentServicePath.slice(0, -1);
        data.serviceName = opera.io.webserver.currentServiceName;
        data.servicePathHash = _hash(data.servicePath);
        data.hostName = opera.io.webserver.hostName;
        data.username = opera.io.webserver.userName;
        data.deviceName = opera.io.webserver.deviceName;
        data.isHomeApp = data.servicePath == '/_root';
        data.requestSection = connection.request.section;
        data.requestPath = connection.request.path;
        data.sessionId = connection.session.id;
        data.ip = opera.io.webserver.publicIP || '';
        data.port = opera.io.webserver.publicPort || '';
        data.session = connection.session;
        data.uniteActionData = connection.uniteActionData;
        data.visitor = {};
        data.visitor.isLocal = connection.isLocal;
        data.visitor.isOwner = connection.isOwner;
        data.visitor.hasCookies = data.sessionId !== undefined;

        if( includePlugins )
        {
            data.plugins = Yusef.getPluginsData( connection );
        }

        return data;
    }


    /**
     *  Add an instance of the plugin in the namespace Yusef.plugins.
     *  <p><strong>Notice:</strong> The plugin gets an extend method, and a 'path' property ( if provided by the LibraryLoader library ).
     *
     *  @param {String}             name    the name of the plugin, to be added in the namespace Yusef.plugins.
     *  @param {function|object}    method  the contructor method or an instance of the plugin
     *
     *  @see #extend
     *  @see #plugins
     *  @see #getPluginsData
     *
     */
    this.addPlugin = function( id, obj )
    {
        if( typeof(id)!=='string' || (id!==id.replace(/^\s+|\s+$/g,'')) )
        {
            throw 'INVALID PLUGIN NAME "'+ (''+id) +'"';
        }
        if( this.plugins[id]!==undefined )
        {
            throw 'PLUGIN NAME COLLISION "'+ (''+id) +'"';
        }
        if( typeof(obj)==='function' )
        {
            var obj = new obj();
        }
        if( typeof(obj)!=='object' )
        {
            throw 'PLUGIN "'+ (''+id) +'" IS NOT AN OBJECT OR A FUNCTION';
        }
        obj.extend          = this.extend;
        if( typeof(Libraries)!=='undefined' && typeof(Libraries.list[ 'yusef.'+id ])!=='undefined' )
        {
            obj.path            = Libraries.list[ 'yusef.'+id ].path;
        }
        this.plugins[ id ]  = obj;

        PSO.pub( 'Yusef.addPlugin', _enumerateObject( obj, 'Yusef.plugins.'+id ) );

        return obj;
    }


    /**
     *  Extend the method "name".
     *  <p><strong>Notice:</strong> The previous version of the method is exposed as the method "proceed" of the extended method. If the method "proceed" is called with no arguments, the arguments passed to the extended method are used instead.
     *  <p><strong>Recommendation:</strong> If an extended method expects more arguments than the orginal method, it is greatly recommended to pass them all as last argument in an "options" object to improve the interoperability with other extensions. It is easier and far less error prone to pass a single "options" object than to pass multiple arguments whose order might differ from extension to extension.</p>
     *
     *  @param  {String}    name        the name of the method to extend
     *  @param  {Function}  method      the new method
     *
     *  @see #addPlugin
     *  @see #plugins
     *
     *  <h3>examples:</h3>
     *  @example
     *  //  The most basic use case of methods' extension: profiling a method.
     *
     *  Yusef.extend
     *  (
     *      'serveFile',
     *      function theExtendedMethod( foo, bar, baz )
     *      {
     *          // timestamp before
     *          var t = new Date().getTime();
     *
     *          // call the original method without touching the arguments
     *          var r = theExtendedMethod.proceed();
     *
     *          // timestamp after
     *          t = new Date().getTime()-t;
     *
     *          // report the time spent in the original method
     *          opera.postError( 'the method took '+ t +' ms' );
     *
     *          // and return the result of the original method
     *          return r;
     *      }
     *  );
     *
     *  @example
     *  //  Extending Yusef.addSectionListener( name, method ) to modify the listener method.
     *
     *  Yusef.extend
     *  (
     *      'addSectionListener',
     *      function theExtendedMethod( name, method, options )
     *      {
     *          var count = 0;
     *          var options = options||{};
     *          var title = options.title||'fallback title';
     *
     *          // modify the listener method
     *          var modifiedMethod = function( connection )
     *          {
     *              // do something really cool
     *              count++;
     *
     *              // call the original listener method
     *              var r = method.call( this, connection );
     *
     *              // do more cool stuff
     *              opera.postError( title +'\n'+ count +'\n'+ r.toString() );
     *
     *              // return the result of the original listener method
     *              return r;
     *          }
     *
     *          // call the original method with the modifiedMethod
     *          // and be careful to pass the options arguments to be nice with other extensions
     *          var r = theExtendedMethod.proceed( name, modifiedMethod, options );
     *
     *          // and return the result of the method called with the modifiedMethod
     *          return r;
     *      }
     *  );
     *
     */
    this.extend = function( methodName, extendingMethod )
    {
        var oldMethod  = this[methodName];
        if( typeof(extendingMethod)=='function' )
        {
        	if( typeof(oldMethod)=='function' )
        	{
                /**
                 *  @inner
                 */
                extendingMethod.proceed  = function()
            	{
            	    return oldMethod.apply( this, arguments.length==0?extendingMethod.arguments:arguments );
                }
            }
            this[methodName] = extendingMethod;
            PSO.pub( 'Yusef.extend', methodName +'\n'+ extendingMethod );
        }
    }


    /**
     *  @private
     */
    function _initialize()
    {
        document.title  = opera.io.webserver.currentServiceName;

        if( self.mountpoints.application )
        {
            //  autoload /application/serverScripts/*.js
            _loadServerScripts();
            _sharePublicFiles();
        }
    }


    //  init
    _initialize();


}();


PSO.pub( 'yusef public members',  _enumerateObject( Yusef, '2 levels of Yusef', 2 ) );