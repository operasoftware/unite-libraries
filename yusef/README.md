## Yusef Library

The Opera Unite application framework — Yusef — is the foundation of Opera Unite applications bundled with Opera. It eases the development of Opera Unite applications by providing a set of core features such as access control, templating, secure administration and actions, image resizing, caching and more. For more information, you can check out our [Yusef: the Unite Server Framework article](http://dev.opera.com/articles/view/yusef-the-unite-server-framework/).

### Yusef plugins

This section lists the plugins associated with Yusef.

#### ACL — Access Control Library

The ACL plugin is available via Yusef.plugins.acl, and provides Opera Unite applications with a customizable access control list.

#### activityStream

activityStream is a simple function that loads in an Atom activity stream.

#### directConnection

directConnection redirects links from the Opera Unite proxy server to instead create a direct connection between two computers (if possible). The proxy provides the external IP:port combination of an Opera Unite server. Each client pings Home using the direct IP:port link, and the successful ones trigger the use of the directConnection plugin.

#### graphics

graphics is a library of simple graphics functions for performing tasks such as generating preview images, and on-the-fly resizing.

#### profileSync

profileSync syncs the user's status (set on the Opera Unite Home Page application) with the profile box appearing in the left hand sidebar of the default UI.

#### translation

This class is a wrapper around the GetText library to make it easier to use in JavaScript and in strings.

#### ui

This plugin allows you to provide a common layout to an Opera Unite application - it adds a skin to an application's output. The common layout will always be added when the output of the service request listener is a String and the connection is still open. In order to create an exception to this flow and prevent the plugin from adding a common layout the service will return a String or close the connection.

This plugin also has support for alternative skins - it is possible to create a different skin than the one provided by default. In order to tell the plugin to use a specific skin a call to `{@link setSkin}` is needed.