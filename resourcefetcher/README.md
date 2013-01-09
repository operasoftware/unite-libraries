## ResourceFetcher

**Note: since April 2012 development and support for Opera Unite has been discontinued. This includes the Opera Unite functionality inside the Opera desktop browser itself, as well as the Opera Unite servers that provided the public `user.operaunite.com` URLs.**

ResourceFetcher is a class for periodically downloading resources from URLs. You can use it to not only download the resources, but also provide reporting on whether the downloads are successful. You can also set parameters such as the time to wait between making each download request, and the time to wait before you assume a download has failed and give a timeout error.

An example:
```var fetcher = new ResourceFetcher();
fetcher.addPreback(onBeforeRequest);
fetcher.addCallback(onResourceUpdated);
fetcher.addErrback(onResourceError);
fetcher.addUrl(url1)
fetcher.addUrl(url2)
fetcher.addUrl(url3)
```

When any of the streams are downloaded the `onResourceUpdated` function will be called with two arguments: the url and the activity stream data

It's possible to add more than one success/error callback. All will be called, but there are no guarantees they will be called in the same order they were added!

It's also possible to add pre-request/success/error callbacks for each URL. This can be done either in the call to addStream:
```fetcher.addUrl(url4, onUrl4Success, onUrl4Fail);```

or by providing a url argument to the addCallback/addErrback/addPreback call:
```fetcher.addCallback(url3)```

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).