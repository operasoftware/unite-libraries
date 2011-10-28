/**
 * @fileoverview
 *
 * ResourceFetcher is a class for periodically downloading resources from URLs
 *
 * An example:
 *
 * var fetcher = new ResourceFetcher();
 * fetcher.addPreback(onBeforeRequest);
 * fetcher.addCallback(onResourceUpdated);
 * fetcher.addErrback(onResourceError);
 * fetcher.addUrl(url1)
 * fetcher.addUrl(url2)
 * fetcher.addUrl(url3)
 * 
 * When any of the streams are downloaded the onResourceUpdated function will
 * be called with two arguments: the url and the activity stream data
 *
 * It's possible to add more than one success/error callback. All will be
 * called, but there are no guarantees they will be called in the same order
 * they were added!
 *
 * It's also possible to add pre-request/success/error callbacks for each url.
 * This can be done either in the call to addStream:
 *
 * fetcher.addUrl(url4, onUrl4Success, onUrl4Fail);
 *
 * or by providing a url argument to the addCallback/addErrback(addPreback call:
 *
 * fetcher.addCallback(url3)
 *
 * @constructor
 * @argument {int} interval time to wait between making requests. Default 5 minues. Optional
 * @argument {int} timeout time in ms to wait before a request is assumed to have died. Default 30 seconds. Optional
 * @argument {int} retries number of times to retry a request before removing it. Default 5. Optional
 * @argument {int} maxConnections Max number of concurrent connections. Default 3. Optional
 */
function ResourceFetcher(interval, timeout, retries, maxConnections)
{

    /**
     * Resources are objects with the shape
     *  {
     *    url: <url>,
     *    updated: <Date object for most recent update>,
     *    retries: <number of retries if it has failed>,
     *    status: <status of last request, or -1 if something bad happened>
     *  }
     *  
    */
    this._resources = [];

    /**
     * Callbacks: [{url, callback}..]
     * If url is None it's for all urls.
     */

    // NOTE: if adding/changing somehing, do not clear any of these arrays by
    // doing this._callbacks = []. That will remove the filter compat stuff
    // if present. @see ResourceFetcher#_installFilterShim
    this._callbacks = [];
    this._errbacks = [];
    this._prebacks = [];
    this._timerId = null;
    this._connections = [];
    this._cronInterval = 2500; // in ms. How often cron fun will run to check if there is work to do.

    this.requestInterval = interval || (1000 * 60 * 5); // in ms. Time between refresh
    this.requestTimeout = timeout || (1000 * 30); // in ms. How long to wait before a request is assumed to have died.
    this.maxRetries = retries || 5;
    this.maxConnections = maxConnections || 3;

    /**
     * If this property is set to a function, the function will be called
     * with three arguments: the response text, the response xml and the
     * connection object itself. The return value from the function is what
     * will be passed on to callbacks. If the function is not defined, the
     * plain response text is what is returned.
     * returned
     *
     * For example, if the client is requesting json data and want it to be
     * parsed in to data structures before being returned, he could set:
     *
     * reseourceFetcher.parser = parseJsonFunction
     *
     * 
     * @type function
     **/
    this.parser = null;

    /**
     * @private
     * @constructor
     */
    this._init = function()
    {
        var self = this;3
        this._installFilterShim(this._resources, this._callbacks,
                                this._errbacks, this._prebacks);
        
        var fun = function() {
            self._cron();
        }
        window.setInterval(fun, this._cronInterval);
    }

    /**
     * Add a url that will be fetched periodically
     * @argument {string} url The url to fetch
     * @argument {function} callback function called when resource has been downloaded. OPTIONAL
     * @argument {function} errback function called if the resource could not be downloaded. OPTIONAL
     * @argument {function} preback function called when the resource is requested. OPTIONAL
     */
    this.addUrl = function(url, callback, errback, preback)
    {
        for (var n=0, resource; resource=this._resources[n]; n++)
        {
            if (url == resource.url)
            {
                return; // url allready in the fetcher
            }
        }
        
        this._resources.push({url: url, updated: null, retries: 0, response: null});
        if (callback) { this.addCallback(callback, url); }
        if (errback) { this.addErrback(errback, url); }
        if (preback) { this.addPreback(preback, url); }
    }
    
    this.removeUrl = function(url)
    {
        var ffun = function(e) { return e.url != url };
        this._resources = this._resources.filter(ffun);
        this._callbacks = this._callbacks.filter(ffun);
        this._errbacks = this._errbacks.filter(ffun);
        this._installFilterShim(this._resources, this._callbacks,
                                this._errbacks, this._prebacks);
    }
    
    /**
     * Add a callback for one or every resource url
     * @argument {function} callback the callback called when resource has been downloaded
     * @argument {string} url the url for which the callback is valid. If not given, callback applies to _all_ urls
     */
    this.addCallback = function(callback, url)
    {
        this._callbacks.push({callback: callback, url: url || null});
    }

    /**
     * Add an errback (error handler) for one or every resource url
     * @argument {function} callback the callback called when there is a problem getting the resource
     * @argument {string} url the url for which the callback is valid. If not given, callback applies to _all_ urls
     */
    this.addErrback = function(callback, url)
    {
        this._errbacks.push({callback: callback, url: url || null})
    }
    
    /**
     * Add an preback (pre-request handler) for one or every resource url
     * @argument {function} callback the callback called just before a resource is requested
     * @argument {string} url the url for which the callback is valid. If not given, callback applies to _all_ urls
     */
    this.addPreback = function(callback, url)
    {
        this._prebacks.push({callback: callback, url: url || null})
    }
    
    /**
     * Force a refresh of  one or all urls
     * Note that any request in progress will finish before refreshing starts
     * @argument {string} url the url to refresh. If omitted, all are refreshed
     */
    this.refresh = function(url)
    {
        if (url)
        {
            for (var n=0, r; r=this._resources[n]; n++)
            {
                if (r.url==url)
                {
                    r.updated = null;
                    // move it to start of resource list so it's the first
                    // in line during the next cron run.
                    this._resources.unshift(this._resources.splice(n, 1)[0]);
                }
            }
        }
        else
        {
            // just clear updated flags. The next cron will do the rest.
            for(var n=0, resource; resource=this._resources[n]; n++){
                resource.updated = null;
            };
        }

    }
    
    /**
     * Return objects with url:<url>, update: <timestamp> for the
     * registered resources in the fetcher.
     * @argument {string} startswith return only urls that start with this string. Optional
     */
    this.getStatus = function(startsWith)
    {
        var ffun = function(e)
        {
            return startsWith ? e.url.indexOf(startsWith)==0 : true;
        }
        return this._resources.filter(ffun);
    }

    /**
     * Periodic task that makes stuff happen..
     *  - checks if there are stale requests
     *  - starts next pending request.
     * @private
     */
    this._cron = function()
    {
        // stop any hanging requests.
        for (var n=0, conn; conn=this._connections[n]; n++)
        {
            var dur = new Date().getTime() - conn.startTime;
            if (dur > this.requestTimeout)
            {
                // A connection seems to have hung
                this._onRequestFail(conn);
                
                // the call to _onRequestFail removed conn from _connections,
                // so we need to roll n back one, to avoid skipping one!
                n--;
            }
        }


        var resource;
        var n=0;
        // if there are free connection slots, see if there's something to do

        while (this._connections.length < this.maxConnections &&
               (resource=this._resources[n++]) )
        {
            if (resource.updated==null ||
                 (new Date().getTime() - resource.updated) > this.requestInterval)
             {
                 this._startRequest(resource);
             }
        }
    }
    
    /**
     * @private
     */
    this._onRequestOk = function(conn)
    {
        // fixme: should guard agains parsers throwing exceptions!
        // But what to do if it throws?
        if (this.parser)
        {
            var data = this.parser(conn.responseText, conn.responseXML, conn);
        }
        else
        {
            var data = conn.responseText;
        }

        // filter function for grabbing all callbacks that apply.
        var ffun = function(e) { return e.url==null || e.url==conn.resource.url; }

        conn.resource.updated = new Date().getTime();
        conn.resource.status = conn.status;

        var callbacks = this._callbacks.filter(ffun);
        for(var n=0, cb; cb=callbacks[n]; n++){
            cb.callback(conn.resource.url, data);
        };

        // remove from active connections list
        for (var n=0, e; e=this._connections[n]; n++)
        {
            if (conn==e)
            {
                this._connections.splice(n, 1);
            }
        }
    }
    
    this._onRequestFail = function(conn)
    {
        if (! conn) // shouldn't happen, but may if there was an exception
        {
            return;
        }

        var resource = conn.resource;
        resource.updated = new Date().getTime();
        resource.retries++;

        // guard around weird exception behaviour when we tried to request
        // resources on hosts that don't resolve. If that happened, accessing
        // .status gives an INVALID_STATE_ERR
        try
        {
            resource.status = conn.status;
        }
        catch (e)
        {
            resource.status = -1;
        }
       
        var ffun = function(e) { return e.url==null || e.url==conn.resource.url; }
        var maxRetries = this.maxRetries;
        var callbacks = this._errbacks.filter(ffun);
        for(var n=0, eb; eb=callbacks[n]; n++){
            eb.callback(resource.url, resource.status || -1, maxRetries - resource.retries);
        }

        if (resource.retries>=this.maxRetries)
        {
            this.removeUrl(resource.url);
        }
        
        // remove from active connections list
        for (var n=0, e; e=this._connections[n]; n++)
        {
            if (conn==e)
            {
                this._connections.splice(n, 1);
            }
        }
    }
    
    /**
     * @private
     */
    this._startRequest = function(resource)
    {

        var ffun = function(e) { return e.url==null || e.url==resource.url; }
        var callbacks = this._prebacks.filter(ffun);
        for (var n=0, cb; cb=callbacks[n]; n++)
        {
            cb.callback(resource.url);
        }

        var conn = new XMLHttpRequest();

        conn.resource = resource;
        conn.startTime = new Date().getTime();
        
        // if this isn't set and a request takes more than cron interval there
        // will be several concurrent requests to the same url
        resource.updated = conn.startTime;

        var self = this;
        var rsfun = function()
        {
            if (conn.readyState == 4)
            {
                if (conn.status == 200)
                {
                    self._onRequestOk(conn);
                }
                else
                {
                    self._onRequestFail(conn);
                }
                self._cron();
            }
        }

        conn.onreadystatechange = rsfun;
        this._connections.push(conn);

        // This is a workaround for some implementations raising security
        // violation instead of following the spec wrgt requests for hosts
        // that can't be found.
        try
        {
            var fetchThis;
            if(resource.url.search(/\?/gi) == -1)
            {
                fetchThis = resource.url + "?q=" + ((new Date()).getTime());
            } else {
                fetchThis = resource.url + "&q=" + ((new Date()).getTime());
            }
            conn.open("GET", fetchThis);
            conn.send(null);
        }
        catch (e)
        {
            this._onRequestFail(conn);
        }
    }


    /**
     * Makes sure the arrays that depend on .filter have that method. Some
     * browsers still don't have the js1.6 functional stuff.
     * @private
     */
    this._installFilterShim = function() // varargs.
    {
        var filter = function(fun)
        {
            var ret = [];
            for (var n=0, e; e=this[n]; n++)
            {
                if (fun(e)) { ret.push(e) }
            }
            return ret;
        }

        for (var n=0; n<arguments.length; n++)
        {
            if (! arguments[n].filter) { arguments[n].filter = filter; }
        }
    }
    
    this.toString = function()
    {
        return "[ResourceFetcher instance]";
    }
    
    this._init(); // invoke constructor!
}