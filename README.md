## Opera Unite utility libraries

The following list contains several Opera Unite utility libraries that we have made available for you to use in your Opera Unite applications. These libraries contain several reusable functions to save you time and make life easier.

### activityStreamGenerator

This file contains an API for publishing to an activity stream (partly based on http://activitystrea.ms/). The resulting stream will be an Atom feed with an activity extension in the "http://activitystrea.ms/spec/1.0/" namespace, which can be used to programatically analyze the feed.

### gettext

gettext is a JavaScript implementation of GNU Gettext, providing internationalization support for JavaScript, eg handling .po files.

### File I/O API

The File I/O API provides you with functionality needed to access data on the desktop from widgets or Unite Apps.

### librariesLoader

This library handles the loading of all your application's external library resources, including making sure all dependencies are present, and that the directory structure is ok.

### PSO: Pub-Sub Output

This library provides a simple pub/sub output, which replaces the functionality of opera.postError and allows developers to easily subscribe to the debug outputs they want.

### ResourceFetcher

ResourceFetcher is a class for periodically downloading resources from URLs. You can use it to not only download the resources, but also provide reporting on whether the downloads are successful. You can also set parameters such as the time to wait between making each download request, and the time to wait before you assume a download has failed and give a timeout error.

### widgetLocalization

widgetLocalization derives the user agent's locale using the algorithm found in http://www.w3.org/TR/widgets/#step-5--derive-the-user-agents-locale. You can then use the gettext library mentioned above to retrieve and handle the appropriate language files for that locale, if they are available.

### Markuper

Markuper is a template library that provides an easy way to develop Opera Unite applications using a specific syntax that developers can use to create bindings between JavaScript code and HTML documents.

### Service Discovery API

The Service discovery API lets you discover services that announce their presence on a network. You can then contact these services and potentially use data from them.

### Yusef

The Opera Unite application framework, foundation of Opera Unite applications.