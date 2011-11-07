/** 
 * This class has no constructor. 
 * @constructor 
 * @class 
 * Web server implementation 
 * 
 * <p>The WebServer offers access to information about the proxy, device and currently running service. It also maintains  
 * incoming connections.</p> 
 * 
 * <p>Services running on the Web server are accessed through a URL on the form: 
 * <code>http://device.host.proxy/service/path</code>, e.g. 
 * <code>http://work.john.operaunite.com/wiki/addEntry</code></p> 
 * 
 */ 
var opera.io.webserver = function () { 
 
    /** 
     * The public facing IP address of this Web server, as seen by the proxy. 
     * 
     * If the Web server does not accept direct connections, this property is <code>null</code>. 
     * @type String 
     */ 
    this.publicIP = ''; 
 
    /** 
     * The public facing port of this Web server, as seen by the proxy. 
     * 
     * If the Web server does not accept direct connections, this property is <code>null</code>. 
     * @type int 
     */ 
    this.publicPort = 0; 
 
    /**  
     * The current connections made to this Web server. Readonly. 
     * 
     * <p>Array-like object containing {@link WebServerConnection} objects representing the current connections to  
     * this Web server.</p> 
     * 
     * <p>Connections remain in this collection even if they are closed. They are removed when there are 
     * no longer any references to the connection elsewhere in the system.</p> 
     * 
     * @type Object 
     */ 
    this.connections = {}; 
 
    /** 
     * The URL the currently running service was downloaded from. Readonly. 
     * 
     * <p>This property can be used to make a download link to the service and can also function 
     * as part of an auto update scheme.</p> 
     * 
     * @type string 
     */ 
    this.originURL = ''; 
 
    /** 
     * The name of the service currently accessing the webserver object, for example 'File Sharing'. Readonly. 
     * 
     * <p>The name of the service, for example as defined in the <code>widgetname</code> element 
     * in the <code>config.xml</code> of a Opera Unite application.</p> 
     * 
     * @type String 
     */ 
    this.currentServiceName = ''; 
 
    /** 
     * The path of the service currently accessing the webserver object, for example '/fileSharing/'. Readonly. 
     * 
     * <p>The path of the service, for example as defined in the <code>servicePath</code> element 
     * in the <code>config.xml</code> of an Opera Unite application. In contrast to the <code>serviceName</code>, 
     * this name can only contain characters that are valid in an IRI.</p> 
     * 
     * <p>The path includes a leading and trailing slash.</p> 
     * 
     * <p>This way a service called "My Cool File Sharing (tm) (c)" can be 
     * identified as simply "share" in it's URL, i.e.  
     * <code>http://work.john.operaunite.com/share</code>.</p> 
     * 
     * <p>In the example above this property would contain '/share/'.</p> 
     * 
     * <p>Note that anything after the first path component is handled by 
     * the service.</p> 
     * 
     * @type String 
     */ 
    this.currentServicePath = ''; 
 
    /** 
     * The name of the proxy the Web server is connected to, for example 'operaunite.com'. Readonly. 
     * 
     * The proxy name is the last part of the full host name,  
     * e.g. <code>operaunite.com</code> as in <code>http://work.john.operaunite.com/wiki</code> 
     * 
     * @type String 
     */ 
    this.proxyName = ''; 
 
    /** 
     * The hostname of the Webserver, for example 'work.john.operaunite.com'. Readonly. 
     * 
     * <p>You may run Web servers on different devices. The hostname contains the device name, 
     * username and proxy address, for example <code>work.john.operaunite.com</code> 
     * as in <code>http://work.john.operaunite.com/wiki</code>.</p> 
     * 
     * <p>Note that this will always be a host name which contains the proxy name.</p> 
     * 
     * <p>This property will not contain the 'admin.' subdomain, if it is used.</p> 
     * 
     * @type String 
     */ 
    this.hostName = ''; 
 
    /** 
     * The name of the device the Web server is running on, for example 'work'. Readonly. 
     * 
     * You may run a Web server on different devices, like two different computers 
     * in your home network and your mobile phone, e.g. <code>work</code> as in http://work.john.operaunite.com. 
     * 
     * @type String 
     */ 
    this.deviceName = ''; 
 
    /** 
     * The My Opera user name of the user owning the Web server, for example 'john'. Readonly. 
     * 
     * For authentication purposes, a <a href="http://my.opera.com">My Opera</a> user name is required for connecting to the 
     * proxy and publishing services. 
     * 
     * @type String 
     */ 
    this.userName = ''; 
 
    /** 
     * The port this Web server is listening to, for example 8840. Readonly. 
     * 
     * You may run multiple Web servers from the same computer by assigning different port 
     * numbers and device names to each instance of Opera running the Web server in opera:config. 
     * Valid ports are in the range 0-65536 
     * 
     * @type String 
     */ 
    this.port = ''; 
 
    /** 
     * Services running on this Web server. Readonly. 
     * 
     * Array-like object containing {@link WebServerServiceDescriptor} objects that describe the services currently running 
     * on this device. You can use this property to discover and communicate with other services, and potentially share data  
     * with them. 
     * 
     * @type Object 
     */ 
    this.services = []; 
 
    /** 
     * Get the MIME content type mapped to a particular file name. 
     * 
     * This function looks up the MIME content type associated with the given file name in Opera. 
     * It can for example be used to set proper headers when serving special types of files. The file name 
     * must contain a period ('.'). 
     * 
     * @param {String} file The file name to get a MIME type for, for example 'index.html'. 
     * @returns {String} The MIME content type mapped to the given file name. 
     */ 
    this.getContentType = function ( file ) 
 
    /** 
     * Add an event listener for incoming requests. 
     * 
     * <p>Listening for requests is done by registering event listeners on the 
     * Web server. The "event name" corresponds to the path fragment of the URL after 
     * the service name, e.g. 'add' as in http://work.john.operaunite.com/wiki/add.</p> 
     * 
     * <p>Registered event handlers are called with an event of the type {@link WebServerRequestEvent}.</p> 
     * 
     * <p>Any request names starting with underscore ('_') is reserved and cannot be used.</p> 
     * 
     * <p>The exceptions are the following request names, which have special meanings:</p> 
     * 
     * <dl> 
     * <dt>_index</dt> 
     * <dd>Event fired when a user accesses the root of the service (i.e. http://work.john.operaunite.com/wiki).  
     * Use this to supply a default start page or similar for your service.</dd> 
     * <dt>_request</dt><dd>Event fired when a user accesses any URL under the service. Use this to catch  
     * all requests to the server in a general fashion. You'll need to use the  
     * {@link WebServerRequest#uri} to distinguish the actual request URI. Listening for this event will also catch 
     * the <code>_index</code> request, but not <code>_close</code>.</dd> 
     * <dt>_close</dt><dd>Event fired when a connection is closed. In this case the <code>connection</code> property 
     * of the <code>event</code> object is null.</dd> 
     * </dl> 
     * 
     * <p>Events for specific event listeners and _index events are fired before the _request event is fired.  
     * Consider the following code example:</p> 
     * 
     * <pre><code>opera.io.webserver.addEventListener('_request', generalhandler, false); 
     *opera.io.webserver.addEventListener('add', addhandler, false);</code></pre> 
     * 
     * <p>The handlers for a specific path, including _index is called before _request.</p> 
     * 
     * <p>If the user visits the URL http://work.john.operaunite.com/wiki/add, a {@link WebServerRequestEvent} is fired,  
     * and the <code>addhandler</code> is called, before the <code>generalhandler</code>  
     * method is called. This happens regardless of which event listener was registered first.</p> 
     * 
     * @param {String} pathFragment Path fragment to add a listener for. 
     * @param {Function} handler Event listener function to add. 
     * @param {boolean} useCapture Whether or not the capture phase should be used. 
     */ 
    this.addEventListener = function ( pathFragment, handler, useCapture ) { ; } 
 
    /** 
     * Remove an event listener from the server. 
     * @param {String} pathFragment Path fragment to remove a listener for. 
     * @param {Function} handler Event listener function to remove. 
     * @param {boolean} useCapture Whether or not this applies to the capture phase. 
     */ 
    this.removeEventListener = function ( pathFragment, handler, useCapture ) { ; } 
     
    /** 
     * Shares a File 
     * 
     * <p>Shares a File from a mountpoint that has been acquired earlier, and makes 
     * it available under the path specified in the second argument.</p> 
     * 
     * <p>The File can be a regular file, a directory or an archive.</p> 
     * 
     * <p>The share is automatically deleted when the application is closed.</p> 
     * 
     * <p>Example: If you have resolved a File to a given folder and then specify <code>opera.io.webserver.shareFile(myFile, 'share')</code>,  
     * it will be shared as the URL <code>http://device.user.proxy/service/share</code></p> 
     * 
     * @param {File} file The File to share 
     * @param {String} path The path this file will be shared as on the Web. 
     * @deprecated This function will be removed shortly. Use {@link #sharePath} instead. 
     */ 
    this.shareFile = function ( file, path ) { ; } 
     
    /** 
     * Unshares a previously shared file 
     * 
     * When a file has been shared using shareFile, it can be unshared again 
     * by calling this method with the same File reference used to share the file 
     * 
     * @param {File} file The file to unshare. 
     * @deprecated This function will be removed shortly. Use {@link #unsharePath} instead. 
     */ 
    this.unshareFile = function ( file ) { ; } 
 
 
    /** 
     * Share the given file on the given URL path. 
     * 
     * <p>The path must be a valid URL path token, and should be a relative sub path of the service.  
     * It should not start with '../' or '/', but you may specify additional path tokens, like 'media/gfx/logo.png'.</p> 
     * 
     * <p>The File can be a regular file, a directory or an archive, but it must be referenced by a mount point.</p> 
     * 
     * <p>ALREADY_SHARED_ERR will be thrown if something is already shared on the given path The share is automatically  
     * deleted when the application is closed.</p> 
     * 
     * <p>Note that if you have added a <code>_request</code> event handler, you will need to compare the incoming requests  
     * with the paths you have shared to see if the request matches a shared file. If so, you will need to call 
     * {@link WebServerResponse#closeAndRedispatch} without changing the uri fo the request to send the request back to  
     * the Web server. On the second pass, the Web server will serve the shared file directly.</p> 
     * 
     * <p>Example: In order to share a resolved File on the path 'media/gfx', you would do the following:</p> 
     * 
     * <pre><code>opera.io.webserver.sharePath('media/gfx', myFile);</code></pre> 
     * 
     * <p>The file will now be shared as the URL <code>http://device.user.proxy/service/media/gfx</code>.</p> 
     * 
     * @param {String} path URL path to share something on. 
     * @param {File} file File to share on the given path. 
     * @throws ALREADY_SHARED_ERR if something is already shared on the given path. 
     */ 
    this.sharePath = function ( path, file ) { ; } 
 
    /** 
     * Unshare a File previously shared on the given URL path 
     * 
     * <p>When a file has been shared using {@link #sharePath}, it can be unshared again 
     * by calling this method with the same path used to share the file.</p> 
     * 
     * <p>Example: Assume that a file has been shared on the path 'media/gfx', i.e. on the URL 
     * <code>http://device.user.proxy/service/media/gfx/</code>, calling this method as follows will unshare the file:</p> 
     * 
     * <pre><code>opera.io.webserver.unsharePath('media/gfx');</code></pre> 
     * 
     * @param {String} path URL path of the file to unshare. 
     */ 
    this.unsharePath = function ( path ) { ; } 
 
} 
 
/** 
 * This class has no public constructor. 
 * @constructor 
 * @class 
 * Data about a service. 
 * 
 * <p>Objects of this class contain basic information about a service and how to reach it. Information about  
 * the service is usually taken from its config.xml.</p> 
 * 
 */ 
var WebServerServiceDescriptor = function () { 
 
  /** 
   * Whether or not this service requires HTTP Digest authentication. 
   * @type boolean 
   */ 
  this.authentication = false; 
 
  /** 
   * The URL this service was originally downloaded from. 
   * @type String 
   */ 
  this.originURL = ''; 
 
  /** 
   * The path to this service, as taken from the <code>widgetname</code> or <code>feature</code> elements 
   * in the config.xml file of the service. 
   * @type String 
   */ 
  this.servicePath = ''; 
 
  /** 
   * Name of this service. 
   * @type String 
   */ 
  this.name = ''; 
 
  /** 
   * Description of this service. 
   * @type String 
   */ 
  this.description = ''; 
 
  /** 
   * Author of this service. 
   * @type String 
   */ 
  this.author = ''; 
 
  /** 
   * URI of this service. 
   * 
   * This is the full URI of the service, e.g. http://work.john.operaunite.com/wiki 
   * 
   * @type String 
   */ 
  this.uri = ''; 
 
} 
 
/** 
 * This class has no public constructor. 
 * @constructor 
 * @class 
 * Connection made to the Web server. 
 * 
 * <p>WebServerConnection holds the incoming request and gives the user access to the outgoing response, 
 * as well maintaining the state of the connection.</p> 
 */ 
var WebServerConnection = function () { 
 
    /** 
     * The incoming HTTP request on this connection. Readonly. 
     * @type WebServerRequest 
     */ 
    this.request = {}; 
 
    /** 
     * The outgoing HTTP response that will be send to the client. Readonly. 
     * @type WebServerResponse 
     */ 
    this.response = {}; 
 
    /** 
     * Whether or not this connection is made through the proxy. 
     * 
     * <p>This property will be false if you access the services through a local URL.</p> 
     * 
     * @type boolean 
     */ 
    this.isProxied = false; 
 
    /** 
     * Whether or not this connection is made directly through the Opera instance. 
     * @type boolean 
     */ 
    this.isLocal = false; 
 
    /** 
     * Whether this connection is made from a page with a URL on the admin subdomain in the same instance running the service. 
     * 
     * <p>You can use this property to determine if the connection is coming from the owner (typically yourself) of the service and 
     * therefore whether to, for example, grant it special privileges. This is the case when the request is the result of accessing a  
     * URL with the admin subdomain.</p> 
     * 
     * @type boolean 
     */ 
    this.isOwner = false; 
 
    /** 
     * Whether or not this connection has been closed. Readonly. 
     * @type boolean 
     */ 
    this.closed = false; 
 
    /** 
     * The id of this connection. Readonly. 
     * @type int 
     */ 
    this.id = 0; 
} 
 
/** 
 * This class has no public constructor. 
 * @constructor 
 * @class 
 * Request made to the Web server. 
 * 
 * <p>WebServerRequest holds information about the incoming request, such as its URI, method and any data  
 * sent along with it.</p> 
 */ 
var WebServerRequest = function () { 
 
    /** 
     * The connection this request was sent through. Readonly. 
     * @type WebServerConnection 
     */ 
    this.connection = {}; 
 
    /** 
     * The HTTP method of this request, one of GET, POST, PUT or DELETE. Readonly.
     *
     * <pre><code>var httpMethod = event.connection.request.method; 
     * if ( httpMethod == "POST" ) { // do something with POST }</code></pre>
     *
     * <p>NOTE: The PUT and DELETE methods are not accessible through the DOM API.</p>
     *
     * @type String 
     */ 
    this.method = ''; 
 
    /** 
     * The IP address of the client that sent this request. Readonly. 
     * 
     * <p class="ni">This currently only gives you the IP address of the proxy.</p> 
     * 
     * @type String 
     */ 
    this.ip = ''; 
 
    /** 
     * The protocol this request was made to. Readonly. 
     * 
     * This is either 'http' or 'https'. Use it to construct links 
     * and redirects and preserve the correct security qualifications of the URIs. 
     * 
     * @type String 
     */ 
    this.protocol = ''; 
 
    /** 
     * The value of the Host header sent with this request. Readonly. 
     * 
     * As opposed to the {@link #uri} property, this will give you the host name the request 
     * was made to, which can be used for among other things redirects. This may contain the 
     * port of the request, i.e. 'foo.bar:80'. 
     * 
     * @type String 
     */ 
    this.host = ''; 
 
    /** 
     * The HTTP headers sent with this request. Readonly. 
     * 
     * <p>This property will contain a dictionary of HTTP headers sent 
     * with this request. As each HTTP header may occur multiple times, 
     * each key/property of the dictionary points to an array-like object 
     * of values:</p> 
     * 
     * <pre><code>firstCookie = request.headers.Cookie[0]; 
     *firstCookie = request.headers['Cookie'][0];</code></pre> 
     * 
     * @type Object 
     */ 
    this.headers = {}; 
 
    /** 
     * The items in the body of this request, meaning data sent as POST. Readonly. 
     * 
     * <p>This property will contain a dictionary of only those items sent as part 
     * of the body of the request, for example large amounts of text or sensitive  
     * information such as passwords that should not be visible in the URL.</p> 
     * 
     * <p>As each CGI parameter may occur multiple times, each key/property of the 
     * dictionary points to an array-like object of values.</p> 
     * 
     * <pre><code>password = request.bodyItems.passwords[0]; 
     *password = request.bodyItems['passwords'][0]; 
     *passwords = request.bodyItems.passwords</code></pre> 
     * @type Object 
     */ 
    this.bodyItems = {}; 
 
    /** 
     * The items sent as part of the query string in this request, meaning data sent as GET. Readonly. 
     * 
     * <p>This property will contain a dictionary of only those items sent as part 
     * of the query string i.e. anything after the ? in the URL.</p> 
     * 
     * <p>As each CGI parameter may occur multiple times, each key/property of the 
     * dictionary points to an array-like object of values.</p> 
     * 
     * <pre><code>user = request.queryItems.user[0]; 
     *user = request.queryItems['user'][0]; 
     *users = request.queryItems.users;</code></pre> 
     * @type Object 
     */ 
    this.queryItems = {}; 
 
    /** 
     * Files uploaded with this request. Readonly. 
     * 
     * <p>This File object represents a virtual directory which points to the 
     * uploaded files. Access the individual files by getting the listing 
     * from the file.</p> 
     * 
     * <p>The name of the file is the filename the user selected when uploading.</p> 
     * 
     * <p>Request headers for these files are available through the metaData property: 
     * <code>req.files[0].metaData.headers['some header'];</code></p> 
     * 
     * <p>See the File API for details about files.</p> 
     * 
     * @type File 
     */ 
    this.files = {}; 
 
    /** 
     * The full body of the HTTP request as a String. Readonly. 
     * 
     * If the body is non existintant or binary, this property is null. 
     * 
     * @type String 
     */ 
    this.body = ''; 
 
    /** 
     * The relative Uniform Resource Identifier this request was made to. 
     * 
     * <p>Relative URI the request is made out to, starting with '/' and the name of the service,  
     * e.g. http://work.john.operaunite.com/wiki/add becomes '/wiki/add'. It is rewritable to allow  
     * redispatching of the request. See the {@link WebServerResponse#closeAndRedispatch} method.</p> 
     * 
     * <p>Setting this property will throw a SECURITY_ERR if an invalid URI is set or if the URI  
     * points to a different service than the one the request was issued from.</p> 
     * @type String 
     */ 
    this.uri = ''; 
 
    /** 
     * Get the values of a HTTP header in the request. 
     * 
     * <p>The returned object is a collection of headers matching the given header name.</p> 
     * 
     * <h3>Example:</h3> 
     * 
     * <p>Assuming that the client sent a request with a header of <code>Foo</code>, access it as follows:</p> 
     * 
     * <pre><code> 
     * headers = request.getRequestHeader('Foo'); 
     * if ( headers ) 
     * { 
     *     opera.postError(headers[0]); 
     * }</code></pre> 
     * 
     * @param {String} requestHeader Name of the HTTP header to get. 
     * @returns {Object} Array-like object with headers matching the given name, or null if there are no headers with the given name. 
     */ 
    this.getRequestHeader = function ( requestHeader ) { ; } 
 
    /** 
     * Get the value of a request item. 
     * 
     * <p>This method gets the values of items sent in a query string (typically through GET requests) 
     * or in the body of the request (typically through POST requests). Each item may occur multiple times 
     * with different values, both in the query string and the body. The optional second argument 
     * <code>method</code> can be used to limit the selection to either of those two.</p> 
     * 
     * <h3>Examples:</h3> 
     * 
     * <p>In the case of a query string <code>foo=bar</code>:</p> 
     * 
     * <p><code>getItem( 'foo' )</code> will produce an array-like object [ 'bar' ].</p> 
     * 
     * <p>In the case of a query string <code>foo=bar&foo=baz</code>:</p> 
     * 
     * <p><code>getItem( 'foo' )</code> will produce an array-like object <code>[ 'bar', 'baz' ]</code>.</p> 
     * 
     * <p>In the case of a query string <code>foo=bar</code> and a request body containing <code>foo=baz</code>:</p> 
     * 
     * <p><code>getItem( 'foo', 'POST' )</code> will produce an array-like object [ 'baz' ].</p> 
     * 
     * @param {String} requestItem Name of the request item to get 
     * @param {String} method Optional argument with the method of the request item to get, either GET or POST. 
     * @returns {Object} Array-like object of values for the given request item, or null if there are no values for the given request item. 
     */ 
    this.getItem = function ( requestItem, method ) { ; } 
} 
 
/** 
 * This class has no public constructor. 
 * @constructor 
 * @class 
 * Event fired when requests are made to the Web server. 
 * 
 * <p>See {@link opera.io.webserver#addEventListener} for details on different event names.</p> 
 */ 
var WebServerRequestEvent = function () { 
 
  /** 
   * Id of the connection this request was generated from. 
   * 
   * If this event was fired for a <code>_close</code> request, this property will hold the id of the closed connection. 
   * 
   * @type int 
   */ 
  this.id = 0; 
 
  /** 
   * The connection this request event was generated from. 
   * 
   * <p>Use this property to access the incoming request and outgoing response:</p> 
   *  
   * <pre><code>req = e.connection.request; 
   *res = e.connection.response;</code></pre> 
   * 
   * <p>If this event was fired for a <code>_close</code> request, this property will be <code>null</code>.</p> 
   * 
   * @type WebServerConnection 
   */ 
  this.connection = null; 
 
} 
 
/** 
 * This class has no public constructor. 
 * @constructor 
 * @class 
 * Response from the Web server. 
 * 
 * <p>The <code>WebServerResponse</code> allows the user to write data back to the client which made a request. It supports 
 * writing string data, bytes of binary data and images.</p> 
 */ 
var WebServerResponse = function () { 
 
    /** 
     * Connection this response will be sent to. 
     * @type WebServerConnection 
     */ 
    this.connection = {}; 
 
    /** 
     * Whether or not this response has been closed. 
     * 
     * This property mirrors the {@link WebServerConnection#closed} property. 
     * 
     * @type boolean 
     */ 
    this.closed = false; 
 
    /** 
     * Whether or not to use chunked encoding in the response. 
     * 
     * <p>Chunked encoding is used when you don't know the length of the encoding when starting to  
     * send data and to avoid frequently closing and reopening connections. It is only recommended 
     * to turn this off if clients are  not expected to support chunked encoding.</p> 
     * 
     * <p>This property defaults to <code>true</code>.</p> 
     * 
     * @type boolean 
     */ 
    this.chunked = true; 
 
    /** 
     * Whether or not to flush data written to the response automatically. 
     * 
     * <p>By default, you need to explicitly call <code>response.flush()</code> in order to 
     * actually send data written to the response. By setting this property 
     * to true, data are flushed immediately when they are written.</p> 
     * 
     * <p>This property defaults to <code>false</code>.</p> 
     * 
     * @type boolean 
     */ 
    this.implicitFlush = false; 
 
    /** 
     * Set the HTTP status code of the response. 
     * 
     * <p>This method sets the status code sent back to the client, 
     * such as 404 (Not found), 200 (OK), etc. An optional argument 
     * can be used to set a specific response text as well, allowing 
     * for messages not in the HTTP specification.</p> 
     * 
     * <p>If you do not set a status code, a 200 (OK) status  
     * code is silently set.</p> 
     * 
     * <p>Note that you must set any status before you start writing  
     * to the response. Failure to do so will result in an INVALID_STATE_ERR.</p> 
     * 
     * @param {String} statusCode Status code to set, e.g. 200 or 404 
     * @param {String} text Status text to set, e.g. "Success" or "Out of pidgeons". Optional. 
     * @throws INVALID_STATE_ERR If data has been written to the response before setting the status code. 
     */ 
    this.setStatusCode = function ( statusCode, text ) { ; } 
 
    /** 
     * Set a HTTP response header. 
     * 
     * <p>Use this method to specify response headers sent back to the client. 
     * For example setting the content type to XML, by doing: 
     * <code>response.setResponseHeader( "Content-type", "text/html" );</code></p> 
     * 
     * <p>Note that you must set any headers before you start writing  
     * to the response. Failure to do so will result in an INVALID_STATE_ERR.</p> 
     * 
     * @param {String} name Name of the HTTP response header to set, e.g. "Content-type" 
     * @param {String} value Value to set for the given HTTP response header. 
     * @throws INVALID_STATE_ERR If data has been written to the response before setting any headers. 
     */ 
    this.setResponseHeader = function ( name, value ) { ; } 
 
    /** 
     * Set the protocol version string of the response. 
     * 
     * <p>Usually the protocol version string will contain a version of HTTP, but it can 
     * be used to set other protocols as well.</p> 
     * 
     * <p>Note that you must set a protocol string before you start writing  
     * to the response. Failure to do so will result in an INVALID_STATE_ERR.</p> 
     * 
     * @param {String} protocolString   Protocol string to set. 
     * @throws INVALID_STATE_ERR If data has been written to the response before setting the protocol string. 
     */ 
    this.setProtocolString = function ( protocolString ) { ; } 
 
    /** 
     * Write data to the response. 
     * @param {String} data String of data to write. 
     */ 
    this.write = function ( data ) { ; } 
 
    /** 
     * Write data to the response and append a newline. 
     * @param data String of data to write. 
     */ 
    this.writeLine = function ( data ) { ; } 
 
    /** 
     * Write binary data to the response. 
     * 
     * This method takes an ECMA 4 <code>ByteArray</code> object and 
     * writes it to the response. 
     * 
     * @param {ByteArray} data Binary data to write 
     */ 
    this.writeBytes = function ( data ) { ; } 
 
    /** 
     * Write a File to the response. 
     * 
     * This methods takes a <code>File</code> object and writes the 
     * contents of the file to the response. 
     * 
     * @param {File} file File object to write 
     */ 
    this.writeFile = function ( file ) { ; } 
 
    /** 
     * Write an image to the response. 
     * 
     * The image can either be an <code>HTMLImageElement</code> or an <code>HTMLCanvasElement</code> object. 
     * In both cases the image or data referenced is serialized and written to the 
     * response, encoded as a PNG image. 
     * 
     * @param {HTMLImageElement} image HTML Image element or Canvas element to write. 
     */ 
    this.writeImage = function ( image ) { ; } 
 
    /** 
     * Flush the data in the response. 
     * 
     * <p>Flush the data in the response and send them to the client immediately. 
     * Used in combination with chunked encoding, where each flush sends a chunk to the  
     * client.</p> 
     * 
     * <p>Flushing is by default an asynchronous operation. You may catch when the 
     * the response is actually flushed by supplying an optional <code>callback</code> parameter.</p> 
     * 
     * @param {Function} callback Function to call when the response is flushed. Optional. 
     */ 
    this.flush = function ( callback ) { ; } 
 
    /** 
     * Close the connection. 
     * 
     * <p>Close the connection and set the {@link WebServerConnection#closed} property of the 
     * corresponding <code>WebServerConnection</code> object to false. No writing to the 
     * the response is possible after <code>close()</code> is called.</p> 
     * 
     * <p>Closing is by default an asynchronous operation. You may catch when the 
     * connection actually closes by supplying an optional callback parameter.</p> 
     * 
     * @param {Function} callback Function to call when the connection is closed. Optional. 
     */ 
    this.close = function ( callback ) { ; } 
 
    /** 
     * Close the connection and redispatch the request to the Web server. 
     * 
     * <p>Close the connection and put the request back into the request queue of  
     * the Web server. The <code>uri</code> property of the <code>WebServerRequest</code> may be rewritten 
     * for this purpose. See the {@link WebServerRequest#uri} property.</p> 
     * 
     * <p>If you have set the status code or added any headers to this response, 
     * these will be sent with the new request. But if you redispatch after having 
     * written to the response it will fail with a <code>INVALID_STATE_ERR</code>.</p> 
     * 
     * <p>If {@link WebServerRequest#uri} is not changed, redispatching the request 
     * will bypass any JavaScript event listeners in the next run. If the URI points 
     * to a shared file, this file will be served. Otherwise a 404 will be shown 
     * to the user.</p> 
     * 
     * @throws INVALID_STATE_ERR If data has been written to this response before it is redispatched. 
     */ 
    this.closeAndRedispatch = function () { ; } 
 
}