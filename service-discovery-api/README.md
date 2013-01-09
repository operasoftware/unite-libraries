## Service discovery API

**Note: since April 2012 development and support for Opera Unite has been discontinued. This includes the Opera Unite functionality inside the Opera desktop browser itself, as well as the Opera Unite servers that provided the public `user.operaunite.com` URLs.**

The service discovery API lets you discover which devices and services are running in you local network, without having to go through DNS. This means you can for example discover and tie together services running in your home, even though these are not available on the Internet.

Examples of use stretches from the simple to the advanced:

* Generating a list of links to devices and their running services
* Remote controlling the playlist on another device
* Producing a combined view of images available on all image hosting services in the network.


Support discovery of remote services may be introduced in the future. This would afford a transparent view of where services are running.

###Locating devices

You'll find all devices that have been discovered in the {@link opera#nearbyDevices} property. This

<pre><code>for ( var i = 0, device; device = opera.nearbyDevices[i]; i++ ) {
    opera.postError(device);  
}</code></pre>

###Locating services

Each {@link DeviceDescriptor} object has a services property which contains information on services run on the device.

<pre><code>for ( var i = 0, service; service = device.services[i]; i++ ) {
    opera.postError(service);
}</code></pre>

###Example: Generate a list of links to all services and devices

This example is relatively simple, although in this example we're using regular DOM methods which makes it a bit verbose. You can use your favorite JavaScript toolkit to generate it, like <a href="http://www.jquery.com">JQuery</a> or <a href="http://developer.yahoo.com/yui/">YUI</a>.

<pre><code>var deviceUl = document.createElement('ul');
var serviceUl;
var li;
var a;

for ( var i, device; <strong>device = opera.nearbyDevices[i]</strong>; i++ )
{
    li = deviceUl.appendChild(document.createElement('li'));
    a = li.appendChild(document.createElement('a'));
    a.href = <strong>device.url</strong>;
    a.textContent = <strong>device.name</strong>;

    if ( ! <strong>device.services</strong> )
    {
        continue;
    }

    serviceUl = li.appendChild(document.createElement('ul'));

    for ( var j, service; <strong>service = device.services[j]</strong>; j++)
    {
        li = serviceUl.appendChild(document.createElement('li'));
        a = li.appendChild(document.createElement('a'));
        a.href = <strong>service.url</strong>;
        a.textContent = <strong>service.name</strong>;
    }
}
</code></pre>

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).