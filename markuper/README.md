## Markup Library

**Note: since April 2012 development and support for Opera Unite has been discontinued. This includes the Opera Unite functionality inside the Opera desktop browser itself, as well as the Opera Unite servers that provided the public `user.operaunite.com` URLs.**

Markuper is a template library that provides an easy way to develop Opera Unite applications.

Usually, when developing an Opera Unite application, you need to output all content through the WebServerResponse.write* functions. That can easily be turned into a cumbersome task when there’s a need to change the document produced—for instance, when the designer wants to revamp the layout of the page. It also violates abstraction layers, between logic and separation, unless you create your own functions to separate them.

The Markuper template library tries to solve these problems, as well as world hunger, by using a specific syntax that developers can use to create bindings between JavaScript code and HTML documents. For more information, check out the [complete article](http://dev.opera.com/articles/view/markuper-unite-template-library/).

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).