/**
@fileoverview

<h2>Service discovery API</h2>

<p>The service discovery API lets you discover which devices and services are running in you local network, without having to go through DNS. This means you can for example discover and tie together services running in your home, even though these are not available on the Internet.</p>

<p>Examples of use stretches from the simple to the advanced:</p>

<ul>
<li>Generating a list of links to devices and their running services</li>
<li>Remote controlling the playlist on another device</li>
<li>Producing a combined view of images available on all image hosting services in the network.</li>
</ul>

<p>Support discovery of remote services may be introduced in the future. This would afford a transparent view of where services are running.</p>

<h3>Locating devices</h3>

<p>You'll find all devices that have been discovered in the {@link opera#nearbyDevices} property. This</p>

<pre><code>for ( var i = 0, device; device = opera.nearbyDevices[i]; i++ ) {
    opera.postError(device);  
}</code></pre>

<h3>Locating services</h3>

<p>Each {@link DeviceDescriptor} object has a services property which contains information on services run on the device.</p>

<pre><code>for ( var i = 0, service; service = device.services[i]; i++ ) {
    opera.postError(service);
}</code></pre>

<h3>Example: Generate a list of links to all services and devices</h3>

<p>This example is relatively simple, although in this example we're using regular DOM methods which makes it a bit verbose. You can use your favorite JavaScript toolkit to generate it, like <a href="http://www.jquery.com">JQuery</a> or <a href="http://developer.yahoo.com/yui/">YUI</a>.</p>

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

*/


/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Metadata about a device
 *
 * <p>A device is most commonly a computer, but can also be cell phones, media centre consoles and the likes.
 * Objects of this class give you access to meta information about the device, such as a name and description and
 * the URL the device is exposed on.</p>
 *
 * <p>Devices are exposed in a {@link DeviceList} object through the {@link opera#nearbyDevices} property.</p>
 *
 * <p>Each device can run zero or more services, exposed in a {@link ServiceList} object in the {@link #services} property.</p>
 *
 */
function DeviceDescriptor ()
{

    /**
     * Constant for whether a device is offline.
     *
     * The value of this constant is 0.
     *
     * @type int
     */
    this.OFFLINE = 0;

    /**
     * Constant for whether a device is online.
     *
     * The value of this constant is 1.
     *
     * @type int
     */
    this.ONLINE = 1;

    /**
     * Unique identifier of this device. Readonly.
     * @type String
     */
    this.id = '';

    /**
     * URL this device is exposed on. Readonly.
     *
     * This URL points to the root of the device. Use it to generate links to the device, or to generate URLs in XHR calls to it.
     *
     * <p>Example:</p>
     *
     * <pre><code>a = document.createElement('a');
     *a.href = device.url;
     *a.textContent = device.name</code></pre>
     *
     * @type String
     */
    this.url = '';

    /**
     * Human-readable name of this device. Readonly.
     * @type String
     */
    this.name = '';

    /**
     * Human-readable description of this device. Readonly.
     * @type String
     */
    this.description = '';

    /**
     * Opera Unite username of the owner of this device. Readonly.
     *
     * If the owner of this device is not an Opera Unite user, this property will be null.
     *
     * @type String
     */
    this.uniteUser = '';

    /**
     * Opera Unite device name for this device. Readonly.
     *
     * If the owner of this device is not an Opera Unite user, this property will be null.
     *
     * @type String
     */
    this.uniteDeviceName = '';

    /**
     * The availability status of this device. Readonly.
     *
     * <p>Typically whether the device is on- or offline. The value of this property is one of {@link #ONLINE} or {@link #OFFLINE}.
     * The list of constants expanded may be included in the future to include statuses like "Busy".</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if ( device.status == device.OFFLINE )
     *{
     *    widget.showNotification(device.name + ' has been been switched off.');
     *}</code></pre>
     *
     * @type int
     */
    this.status = 0;

    /**
     * Services running on this device. Readonly.
     *
     * <p>If this device is not running any services, the list is empty.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>for ( i = 0, service; device.services[i] i++ )
     *{
     *    li = list.appendChild(document.createElement('li'));
     *    a = li.appendChild(document.createElement(a));
     *    a.href = service.url;
     *    a.textContent = service.name;
     *}</code></pre>
     *
     * @type ServiceList
     */
    this.services = {};


}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Metadata for a service
 *
 * <p>A service is an application that exposes itself through a Web interface and allows users to view it or interact with it programatically. 
 * Objects of this class give you access to information such as the name and description of a service and which URL it is exposed on.
 * This says nothing of the capabilities of the service, so other services will need to know about the internal workings of the service
 * in order to communicate with it.</p>
 *
 * <p>Services are exposed in a {@link ServiceList} object through the {@link DeviceDescriptor#services} property.</p>
 */
function ServiceDescriptor ()
{

    /**
     * Constant for whether a service is offline.
     *
     * The value of this constant is 0.
     *
     * @type int
     */
    this.OFFLINE = 0;

    /**
     * Constant for whether a service is online.
     *
     * The value of this constant is 1.
     *
     * @type int
     */
    this.ONLINE = 1;

    /**
     * The availability status of this service. Readonly.
     *
     * <p>Typically whether the service is on- or offline. The value of this property is one of {@link #ONLINE} or {@link #OFFLINE}.
     * The list of constants expanded may be included in the future to include statuses like "Busy".</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if ( service.status == service.OFFLINE )
     *{
     *    widget.showNotification(service.name + ' has been disabled.');
     *}</code></pre>
     *
     * @type int
     */
    this.status = 0;

    /**
     * Unique identifier for this service. Readonly.
     * @type String
     */
    this.id = '';

    /**
     * Human-redable name of this service. Readonly.
     * @type String
     */
    this.name = '';

    /**
     * URL this service is exposed on. Readonly.
     *
     * <p>This URL points to the root of the service. Use it to generate links to the service, or to generate URLs in XHR calls to it.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>a = document.createElement('a');
     *a.href = service.url;
     *a.textContent = service.name</code></pre>
     *
     * @type String
     */
    this.url = '';

    /**
     * Human-redable description of this service. Readonly.
     * @type String
     */
    this.description = '';

    /**
     * Whether this service is an Opera Unite service. Readonly.
     * @type Boolean
     */
    this.isUniteService = {};

    /**
     * The device this service belongs to. Readonly.
     * @type DeviceDescriptor
     */
    this.device = {};


}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * A list of services.
 *
 * <p>ServicesLists are exposed as the {@link DeviceDescriptor#services} property.</p>
 *
 * <p>You can access elements in the list as you would access a dictionary, either through the index or the identifier of a service.</p>
 *
 * <pre><code>service = device.services[3];
 *service = device.services[serviceId];
 * </code></pre>
 */
function ServiceList ()
{

    /**
     * Number of services in this list. Readonly.
     * @type int
     */
    this.size = 0;


    /**
     * Get the service at the given position in the list.
     * @param {int} index Positive integer denoting the position of the service in the list.
     * @return {ServiceDescriptor} Service at the given position, or undefined if the index is out of bounds.
     */
    this.getServiceByIndex = function ( index ) { }

    /**
     * Get the service with the given id from the list.
     * @param {String} id Identifier of the service to retrieve.
     * @return {ServiceDescriptor} Service with the given identifier, or undefined if no service has the given identifier.
     */
    this.getServiceByID = function ( id ) { }

}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * A list of devices.
 *
 * <p>DeviceList is exposed as the {@link opera#nearbyDevices} property.</p>
 *
 * <p>You can access elements in the list as you would access a dictionary, either through the index or the identifier of a device.</p>
 *
 * <pre><code>device = opera.nearbyDevices[3];
 *service = opera.nearbyDevices[deviceId];
 * </code></pre>

 */
function DeviceList ()
{

    /**
     * Number of devices in this list. Readonly.
     * @type int
     */
    this.size = 0;


    /**
     * Get the device at the given position in the list
     * @param {int} index Positive integer denoting the position of the device in the list.
     * @return {DeviceDescriptor} Device at the given position, or undefined if the index is out of bounds.
     */
    this.getDeviceByIndex = function ( index ) { }

    /**
     * Get the device with the given id from the list.
     * @param {String} id Identifier of the device to retrieve.
     * @return {DeviceDescriptor} Device with the given identifier, or undefined if no device has the given identifier.
     */
    this.getDeviceByID = function ( id ) { }

}


/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Placeholder for Opera-specific functionality.
 */
var opera = function () {

  /**
   * Local devices available to this Opera instance. Readonly.
   *
   * <p>This list contains all the devices this Opera instance has discovered on the local network.</p>
   *
   * <p>You can access it as a regular JavaScript object, using both an index and an identifier:</p>
   *
   * <pre><code>device = opera.nearbyDevices[3];
   *device = opera.nearbyDevices[deviceId];</code></pre>
   *
   * @type DeviceList
   */
  this.nearbyDevices = {};
}