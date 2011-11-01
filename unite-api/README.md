##Unite API
  
###Opera Unite Web server APIs

This API document describes the JavaScript bindings for the Opera Unite Web Server,
available through Opera Unite applications. Opera Unite applications supply Web services
served directly from the user's computer.

Opera Unite applications are packaged like Opera Widgets with a config.xml file.

Note that no methods in this API return actual arrays. Instead they return
objects whose properties can be iterated over in an array style syntax, i.e. <code>array[i]</code>.
Methods like <code>push()</code>, <code>shift()</code>, <code>sort()</code>, and so on are not available.

<h4>Enabling the Web server API</h4>

In order to make the file system and its methods available, you need to add a <code>feature</code> element to your config.xml file like this:

<pre><code>&lt;widget&gt;
  ...
  &lt;feature name="http://xmlns.opera.com/webserver"&gt;
    &lt;param name="servicepath" value="chat" /&gt;
  &lt;/feature&gt;
  ...
&lt;/widget&gt;</code></pre>

The <code>servicepath</code> parameter is required and defines the path the service will be accessed from. See the <a href="#urls">note on service URLs</a> for more information.

The entry point to the API becomes available as a JavaScript object <code>opera.io.webserver</code>.

<h4 id="urls">Opera Unite applications and URLs</h4>

Opera Unite users may start a Web server on different devices running Opera, for example on a home and work computer, a living room media center and a mobile phone. The user may install a set applications on each Web server, providing several services . A service is typically a single application, for example a file sharing service or a multiplayer chess service. Services can accessed on the following general URL:

<code>http://device.user.proxy/service/path</code>

For example:

<code>http://work.john.operaunite.com/wiki/add</code>

The username is the user's My Opera username.

The device name is whatever the user has chosen when enabling the Web server. It's tied to one instance of Opera.

The proxy is a server run by Opera, proxying requests between servers and clients.

The service, or service path, is the IRI name of the service, as defined in config.xml.

The path represents a file or instruction the service will handle.

Note that only valid IRI characters can be used as part of the device name, username and service name.

<h4>Working with requests and responses</h4>

The function of a Web server is to listen to requests from clients, process them and issue a response, for example send a Web page or the result of a script. Requests occur when the user visits a particular service URL. The request may contain form data, send via GET and POST and uploaded files.

In the case of the Opera Unite Web Server you listen to requests from clients by adding event listeners to the <code>opera.io.webserver</code> object:

<pre><code>opera.io.webserver.addEventListener('path',somehandler,false);</code></pre>

The path corresponds to the first path component in the URL after the service name, for example:

<pre><code>opera.io.webserver.addEventListener('add',addHandler,false);</code></pre>

In this case, if the user visits the URL

<code>http://work.john.operaunite.com/wiki/add</code>

The application will pick it up and call the supplied <code>addHandler</code> function.

Handler functions are passed a <a href="WebServerRequestEvent.dml#">WebServerRequestEvent</a> object as an argument. This event object gives access to the incoming connection (<a href="WebServerConnection.dml#">WebServerConnection</a>), the incoming request (<a href="WebServerRequest.dml#">WebServerRequest</a>), and the response (<a href="WebServerResponse.dml#">WebServerResponse</a>) the author can write data to. The <code>addhandler</code> could look something like this:

<pre><code>function addHandler(e)
{
    //Shorthands
    var req = e.connection.request;
    var res = e.connection.response;

    //Get article from POST data
    var article = req.bodyItems['article'][0];

    //...Store the article data

    //Write a response back to the client
    res.write('Article updated');
    res.close();

}</code></pre>

Data sent as GET are available in the <code>queryItems</code> property of the request. Data sent as POST are available in the <code>bodyItems</code> property. The body of the request is also available in the raw form in the <code>body</code> property. If files were attached, these are available in the <code>files</code> property of the request.

The <code>response</code> object has methods for sending different kinds of data, for example <code>writeImage()</code> and <code>writeFile()</code>.

You may supply a custom protcol string, status code and headers, but these must be set before data is written to the response.

Note that requests may not begin with '_', as this is reserved for special, system generated events.

<h5>Special requests: _index, _request, _close</h5>

The Web server supports three special requests.

<dl>
  <dt>_index</dt>
  <dd>This request occurs when a user visits the root of the service, e.g. <code>http://work.john.operaunite.com/share</code>. If you do not listen for this request, the file <code>public_html/index.html</code> will be served when the user visits the root of the server.</dd>
  <dt>_request</dt>
  <dd>This is a special request that catches all incoming requests, except for <code>_close</code>. Use this to gain fine grained control of the requests made to the server. You'll need to use <a href="WebServerRequest.dml#uri">WebServerRequest.uri</a> to differentiate between different requests. This request also catches <code>_index</code>, but not <code>_close</code>.</dd>
  <dt>_close</dt>
  <dd>This request occurs when a connection is closed. The connection property of the resulting event is a dummy object, while the <code>id</code> property contains the id of the closed connection.</dd>
</dl>

If the developer adds event listeners for both _request and some specific path, the event handler for the specific path will be called before the _request handler. Handlers for _index are also fired before _request.

<h5>Redispatching requests</h5>

You can redispatch a request to a new URI by changing the <a href="WebServerRequest.dml#uri">WebServerRequest.uri</a> property and calling the <a href="WebServerResponse.dml#closeAndRedispatch">WebServerResponse.closeAndRedispatch()</a> method.
This is useful for example for correcting commonly mistyped URLs, chaining requests and providing authentication across the entire service. For example:

<pre><code>
if ( ! authenticated )
{
  request.uri = opera.io.webserver.currentServicePath + 'loginform';
  response.closeAndRedispatch();
}
</code></pre>

And headers, GET or POST data in the original request are sent along with the redispatched request.

Note that <code>uri</code> must be set to a relative URI path, starting with '/' and the name of the service (the <a href="opera.io.webserver.dml#currentServicePath">opera.io.webserver.currentServicePath</a> property), potentially followed by more path components, for example '/blog/add'.

If a request is redispatched, none of the special event handlers, like <code>_request</code> will be fired.

<h5>Requests and files</h5>

If an incoming request URI matches a shared file or a file in <code>public_html</code>, the file will be served.

However, if you listen for the <code>_request</code> event, even requests to files will be intercepted. In order to serve the
file, you'll need to call <a href="WebServerResponse.dml#closeAndRedispatch">WebServerResponse.closeAndRedispatch()</a> without changing the URI.

<h4>Sharing files</h4>

You can share files from a local disk through your Web server. Use the <a href="opera.io.webserver.dml#sharePath">opera.io.webserver.sharePath()</a> and <a href="opera.io.webserver.dml#unsharePath">opera.io.webserver.unsharePath()</a> methods.
The first takes two arguments - a URL path and a  <code>File</code> object retrieved using the File I/O API. The path denotes which sub-path of your service the file will be accessible on.

Here's an example:

<pre><code>//mount a directory using File I/O, get a reference to it called 'dir'
opera.io.webserver.sharePath('myShare', dir);</code></pre>

Assuming the device is called 'work', the user is called 'john' and the service is called 'fileSharing', the directory will now be available on the
URL <em>http://work.john.operaunite.com/fileSharing/myShare</em>.

To unshare a path, call the <a href="opera.io.webserver.dml#unsharePath">opera.io.webserver.unsharePath()</a> method with the path you've previously shared something on:

<pre><code>opera.io.webserver.unsharePath('myShare');</code></pre>

Note that for security reasons the contents of a shared directory is not listed automatically. If you visit the URL of a shared directory, you will get a 404 error code. You may still access files under the shared directory, for example:

<em>http://work.john.operaunite.com/fileSharing/myShare/notes.txt</em>

You'll need to listen for the name of the share as a request, and serve a listing to the client yourself.

If you do listen for the <code>_request</code> event to serve directory listings, you will also need to check for requests to files under a shared path. If you catch such references, you need to call <a href="WebServerResponse.dml#closeAndRedispatch">WebServerResponse.closeAndRedispatch()</a> without changing the <a href="WebServerRequest.dml#uri">WebServerRequest.uri</a> property of the request to send the request back to the Web server. On the second pass, the Web server will serve the shared file directly.

<h4>Uploading files</h4>

You can upload files using a normal file upload form. Once uploaded, the file will be available in the <a href="WebServerRequest.dml#files">WebServerRequest.files</a> property. This is a special <code>File</code> object that functions like a directory. You can iterate through it to locate your uploaded file.

The File object and its children will be deleted when the request object goes out of scope. You must make sure to read it or copy it before this happens.

<pre><code>for ( var i = 0, file; file = request.files[i]; i++ )
{
    file.copyTo('/storage/' + file.name);
}</code></pre>

The value of the name property of the File object will be the same as the file name the uploaded file had on the user's disk.

Each uploaded file has a <code>metaData</code> property, which contains a dictionary of headers for that uploaded file.

<h4>Working with cookies</h4>

You can set cookies using the <code>Set-Cookie</code> header as you would for a normal Web page using the <a href="WebServerResponse.dml#setResponseHeader">WebServerResponse.setResponseHeader()</a> method:

<pre><code>response.setResponseHeader('Set-Cookie', 'session=' + seesionId );</code></pre>

The cookie will not be valid for any other domains, nor the admin subdomain. Setting the domain attribute does not override this. This means that if the current request is made out to the admin subdomain, setting a cookie in the response will set it for the admin subdomain.

If you do not specify a path, the Web server will set it to the path of the current service. Cookies are not shared among services.

<h4>Generating administration pages: The admin subdomain and WebServerRequest.isOwner</h4>

In order to allow administration of the service, the developer will need to be able to positively identify a user as the owner of the service. Administration pages can be accessed through the admin subdomain of the service.

The following URL pattern will be interpreted as an administration page:

<em>http://<strong>admin.</strong>device.user.operaunite.com/path</em>

For example:

<em>http://admin.work.john.operaunite.com/fileSharing/</em>

URLs on this form can only be accessed successfully from the same instance of Opera running the application. If it is accessed in any other way, for example through another browser, the user will be redirected to the non-admin version of the page.

In cases where a service page is successfully accessed through http://admin., the corresponding <a href="WebServerConnection.dml#">WebServerConnection</a> object will have its <code>isOwner</code> property set to true. Developers can check this property and provide an administration interface:

<pre><code>if ( e.connection.isOwner )
{
    showAdminPage();
}</code></pre>

The admin page for the root service is special and may be used to provide admin-links to other installed applications. This service is integrated into Opera. It's available on the URL:

<em>http://admin.work.john.operaunite.com/</em>

When accessing service pages in the same instance, Opera will sometimes either ask the user to confirm the action or block the access. The reason for asking for a confirmation is to protect the user from malicious links which may result in cross-posting and destructive operations on the application. The table below summarized the different cases:

<TABLE style="">
	<TBODY>
		<TR>
			<TH class="right thGroup">From page \ To Page</TH>
			<TH>Admin root, start URL</TH>
			<TH>Admin root, other URL</TH>
			<TH>Admin same service, start URL</TH>
			<TH>Admin same service, other URL</TH>
			<TH>Admin other service, any URL</TH>
			<TH>Non-admin, any URL</TH>
		</TR>
		<TR>
			<TH class="right">From panel, bookmarks or UI</TH>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
		</TR>
		<TR>
			<TH class="right">From root admin, any URL</TH>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
		</TR>
		<TR>
			<TH class="right">From service admin, any URL</TH>
			<TD class="open">open</TD>
			<TD class="block">block</TD>
			<TD class="open">open</TD>
			<TD class="open">open</TD>
			<TD class="block">block</TD>
			<TD class="open">open</TD>
		</TR>
		<TR>
			<TH class="right">From non-admin, locally hosted root (isLocal = true)</TH>
			<TD class="open">open</TD>
			<TD class="warning">warning</TD>
			<TD class="open">open</TD>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="open">open</TD>
		</TR>
		<TR>
			<TH class="right">From non-admin, locally hosted service (isLocal = true)</TH>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="open">open</TD>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="open">open</TD>
		</TR>
		<TR>
			<TH class="right">From regular page</TH>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="warning">warning</TD>
			<TD class="open">open</TD>
		</TR>
	</TBODY>
</TABLE>

The start URL of a service or the root, is the minimal URL, ending in a slash, without path, filename, query arguments or hash.

If a warning is shown, and the user chooses to continue, any POST request is changed to a GET request.

In order to maintain security, the services will by default ignore requests for administration access from other instances or browsers. There is no native way of doing remote administration of applications. Developers can relax this model by implementing additional administration using authentication and nonces. It is not possible to access the admin subdomain through an IP address or through localhost, so the same applies in this case.

<b>Author:</b> Hans S. Toemmerholt, Web Applications, Opera Software ASA

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).
