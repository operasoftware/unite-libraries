## Libraries Loader

**Note: since April 2012 development and support for Opera Unite has been discontinued. This includes the Opera Unite functionality inside the Opera desktop browser itself, as well as the Opera Unite servers that provided the public `user.operaunite.com` URLs.**

This library handles the loading of all your application's external library resources, including making sure all dependencies are present, and that the directory structure is OK.

### Summary
The Libraries Loader walks the subfolders of /application/libraries/ and /application/libraries/<libName>/plugins/ ( svn:externals ) in parse a manifest file declaring the id, scripts and dependencies of the library or plugin. Which gives the following overall file structure to your Unite Service:

```/config.xml
/index.html
/libraries/
/libraries/foo/
/libraries/foo/setup.xml
/libraries/foo/pi.js
/libraries/foo/pa.js
/libraries/foo/plugins/
/libraries/foo/plugins/baz/
/libraries/foo/plugins/baz/setup.xml
/libraries/foo/plugins/baz/po.js
/libraries/bar/
/libraries/bar/setup.xml
/libraries/bar/pu.js
```
    
The manifest files, setup.xml, have the following syntax:

```<setup id="timer">
  <script>timer.js</script>
  <depend>json</depend>
  <depend>pso</depend>
</setup>
```

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).