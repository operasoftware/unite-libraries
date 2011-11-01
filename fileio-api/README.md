##File IO API

This API document describes the JavaScript bindings for accessing
the local file system in Opera.

###The basics

The File I/O API consists of three classes: `FileSystem`, `File` and `FileStream`.

The `FileSystem` class is initialized as a singleton, and is available as `opera.io.filesystem`.
This is a virtual file system. In order to actually use it, you'll need to add directories
from your actual file system as mount points to the virtual filesystem.

The `File` object works like similar objects in other frameworks. It can point to a directory,
archive or regular file. It exposes properties like `path`, `isDirectory`, `exists`, 
`parent`, etc. It also works as an array to let you access files and subdirectories in a directory.

The `FileStream` is used when you want to read from or write to the files in the filesystem.
It supports reading and writing text, images, binary data and Base64 text.

###Enabling File I/O

In order to make the file system and its methods available, you need to add a `feature` element to your config.xml file like this:

<pre><code>&lt;widget&gt;
  ...
  &lt;feature name="http://xmlns.opera.com/fileio"&gt;
    &lt;param name="folderhint" value="home" /&gt;
  &lt;/feature&gt;
  ...
&lt;/widget&gt;</code></pre>

The `folderhint` parameter is used in conjunction with the <a href="#shared">shared folder</a>. If the parameter is present, the user will be presented with a file dialogue that defaults to a directory corresponding to the value of the parameter. If multiple `folderhint` parameters are present, and the implementation supports only one shared folder, the last is used. If the parameter values do not correspond to a directory, the system will use its default starting location for the file dialogue.

If no `folderhint` parameter is present, no dialogue will be presented to the user and no shared folder will be available.

The following folder hints are recognized:

<dl>
<dt>home</dt><dd>The user's default home directory, or other appropriate directory (My documents on Windows, /home/username/ on Linux, /Users/username/ on Mac)</dd>
<dt>pictures</dt><dd>The user's default pictures directory</dd>
<dt>music</dt><dd>The user's default music directory, such as /home/username/Documents/My Videos on Ubuntu)</dd>
<dt>video</dt><dd>The user's default video directory</dd>
<dt>documents</dt><dd>The user's default documents directory ( such as /home/username/Documents on Ubuntu)</dd>
<dt>downloads</dt><dd>If the user has a default downloads directory</dd>
<dt>desktop</dt><dd>The desktop, where applicable.</dd>
</dl>

You may compress multiple `param` elements to `value="home music pictures"`.

<em>The following method is deprecated:</em> In order to make the file system and its methods available, you need to add a `file` attribute with the value `yes` to the `widget` element in the config.xml file of your Opera Widget or Opera Unite Application.

###Mount points

Instead of accessing the file system directly, this API uses a concept of mount points. In order to access 
parts of a disk, it must first be mounted as a mount point in a virtual filesystem. There are two types of mount points:

<ul>
  <li>Predefined <strong>system mount points</strong> activated by the {@link opera.io.filesystem#mountSystemDirectory} method.</li>
  <li><strong>General mount points</strong> created from anywhere on the user's disk, using the {@link opera.io.filesystem#browseForDirectory} and {@link opera.io.filesystem#browseForFile} methods.</li>
</ul>

<h5>System mountpoints: the application, storage and shared directories</h5>

There are three special directories you can use with the File I/O API:

<ul>
  <li>The <strong>application</strong> directory, which contains the actual files in the application accessing the 
file system. If the application is a widget, this directory will contain all the files in the widget, like config.xml, 
index.html and others. This directory is always mounted as readonly.</li>
  <li>The private <strong>storage</strong> directory, which can be used to save temporary files and configuration 
information specific to the application. The files stored in this directory persist until the application is uninstalled.</li>
  <li id="shared">The private <strong>shared</strong> directory, which can be used to share and store files. This directory is typically chosen by the user when installing the application, and is accessible to the user in the normal file system. One example of use is sharing a set of images from somewhere on the user's disk.</li>
</ul>

These are not available by default and need to be mounted using the {@link opera.io.filesystem#mountSystemDirectory}.
method:

<pre><code>opera.io.filesystem.mountSystemDirectory('shared');
opera.io.filesystem.mountSystemDirectory('storage','myCoolSaves');</code></pre>

Once mounted, they become available under in the `opera.io.filesystem.mountPoints` property.

You may specify an optional name to mount these directories as. If not supplied, it defaults to `application`, `storage` and `shared` respectively.

In the example above shared directory will be mounted as `shared` and have a path `/shared`,
while storage will be mounted as `myCoolSaves` and have a path `/myCoolSaves`.

These can then be accessed as regular mount points and through the mountpoint URL protocol as other mounted files, except that the `application` directory is mounted as read-only.

<p class="warning" style="color: red">WARNING: The `shared` directory will be read-write, unless the underlying 
file system defines it to be read-only. Be careful to protect your data by controlling how data gets written to it. You 
should supply some sort of authentication of users who access data in this folder and be careful to not leave code open to exploitation.

<h5>Creating your own mount points</h5>

<p class="note">Note: Creating mount points with the `browseFor*` methods is not supported in Opera Unite Applications. It should be possible for Opera Widgets. Mounting system mount points should work in both cases.

It is possible to create your own mount points from any directory on the user's disk, using the {@link opera.io.filesystem#browseForDirectory}, {@link opera.io.filesystem#browseForFile} and {@link opera.io.filesystem#browseForSave} methods.

These functions will open a file dialog, and let the user choose a file to share. The
selected file is returned as an argument to a callback function. If the user cancels the
dialog, or the selected file is somehow invalid, the callback function is called with
null.

<p class="warning" style="color: red">WARNING: Once mounted, the mount point will be read-write unless the 
underlying file system defines it to be read-only. Be careful to protect your data by controlling how data
gets written to them. You should supply some sort of authentication of users who access these directories 
and be careful to not leave code open to exploitation.

The following is an example using `browseForDirectory()`, which is the most common case:
 
<pre><code>opera.io.filesystem.browseForDirectory( 'share', '', processDir ); //Let the user choose a directory
function processDir( dir )
{
    if ( ! dir )
    {
        return; //Invalid file or canceled dialog
    }
    opera.postError(dir.path);
}</code></pre>
 
In this case, 'share'; becomes the name of the directory in the virtual file system. The `processDir` function is called with the file the user selects.

Mount points become available in the `opera.io.filesystem.mountPoints` property. This object is a `File` 
object.

<h5>The mountpoint URL protocol</h5>

In some cases, you want your application to be able to reference files
that have been mounted in the virtual file system from a Web page. You can use the mountpoint URL protocol
for this purpose. A mountpoint URL starts with `mountpoint://`, followed by the name of a mount point
and a path to a file under that mount point.

For example, if a user has added a mount point, and named it `myImages` using the call:

<pre><code>browseForDirectory("myImages","",callback_function);</code></pre>

the user can access files inside the mount point by creating an absolute URI:

<pre><code>&lt;img src="mountpoint://myImages/avatar.png"&gt;</code></pre>

###Paths

Note that the path separator is always `'/'`, regardless of the underlying file system.

The `fileSystem.mountPoints` property represents the root of the file system and has the path `'/'`.

A mount point mounted with the name foo has the path `'/foo'`.

All files belong to only one mount point, so if a directory mounted as `'foo'` has a file called 
`'bar'`, the path of the file is `'/foo/bar'`.

Paths that begin with `'/'` are absolute paths, starting from the root and moving down through a 
mount point, through any subdirectories and potentially to a file.

You may use relative paths. Any path not starting with a '/' is a relative path. The '.' and '..' directory references
are supported. Paths are relative to the current directory. If `file` is a regular file, and you call 
`file.moveTo('some/path')` or similar methods, the path is relative to the parent directory of `file`. 
If `file` is a directory, the path is relative to that directory.

###Working with files

You obtain an initial file by adding a mount point as described earlier. From here you have two options:

If the mount point is a directory, you can move into its content as described in the next section.

You can use the `resolve()` method on the initial `File` object to get a reference to a File
somewhere under the mount point. This method takes a path as an argument and will attempt to resolve it. If
the path is valid, an `File` object is returned. Note that the file does not need to exist; the path simply needs to be a possible valid path.

<pre><code>var file = mp.resolve('path/to/my/file');</code></pre>

Note that the path separator is always '/', regardless of the underlying file system.

Some important properties of the `File` object:

<dl>
<dt>exists</dt><dd>Check if the file referenced by this `File` object actually exists. Especially useful when using the `resolve()` method.</dd>
<dt>isFile</dt><dd>If the `File` object references a regular file.</dd>
<dt>isDirectory</dt><dd>If the `File` object references a directory.</dd>
<dt>created</dt><dd>When the file was created.</dd>
<dt>modified</dt><dd>When the file was last modified.</dd>
<dt>path</dt><dd>The path to this file in the virtual file system, starting with '/' and the name of the mount point.</dd>
</dl>

You may copy and move files by using the `copy` and `moveTo` methods:

<pre><code>file.copyTo('path/to/copy');
file.moveTo('new/name/of/file');</code></pre>

Both methods take an optional argument `overwrite`, which will cause any existing files with the new path to be overwritten.

To create a new directory, use the following syntax:

<pre><code>var file = mountPoint.createDirectory(somePath);
var file = mountPoint.createDirectory(mountPoint.resolve(somePath));</code></pre>

In order to write files, you need to open a `FileStream` to the file and write to it. See the section on <a href="#stream">working with streams</a>.

To delete files or directories, use the `deleteFile()` or `deleteDirectory()` methods:

<pre><code>mp.deleteFile('path/to/file');
mp.deleteDirectory('path/to/directory', true);</code></pre>

Both methods may take a `File` object instead of a path. The second argument is to delete content recursively

###Working with directories

A `File` object made from a directory points to its subdirectories and contained files.
The `File` object supports a `length` property and an array-like syntax to access these subfiles.
Note that the subfiles and directories need to be 'refreshed' before you can actually access
them. Through this process, information about the files in the directory are loaded into the virtual
filesystem. The method `refresh()` is used for this purpose:

<pre><code>dir.refresh(); //Load the contents of the directory
for ( var i = 0, file; file = dir[i]; i++ )
{
    opera.postError(file.path + ' ' + file.isDirectory + ' ' file.isFile);
}</code></pre>

When the file is a directory, its `length` property will tell you how many files and subdirectories there are in the directory.

It's important to note that information about the subfiles and directories of this directory is
<strong>not live</strong>. If files are added, moved or deleted, you need to call `refresh()` again to update
the information in the `File` object.

You can similarly recurse through the file structure.

<h4 id="stream">Reading and writing: Working with files streams

In order to read or write to a file, you need to make a `File` object and then open it for reading or writing 
using the `open` method:

<pre><code>var stream = dir.open('newfile', opera.io.filemode.WRITE);
stream.writeLine('hello');
stream.close();
stream = dir.open('newfile');
var data = stream.readLine();
opera.postError(data);</code></pre>

Using `opera.io.filemode.WRITE` will overwrite all data in the file. Use `opera.io.filemode.APPEND` to append data instead. If the file does not exist, it is immediately created when opened in either of these modes.

The following modes are supported:

<dl>
<dt>READ</dt>
<dd>Open the file for reading. If the file doesn't exist, throw an exception.</dd>
<dt>WRITE</dt>
<dd>Open the file for writing. This will delete everything in the file first. If the file doesn't exist, it is created.</dd>
<dt>APPEND</dt>
<dd>Open the file appending. This will write data at the end of the file. If the file doesn't exist, it is created.</dd>
<dt>UPDATE</dt>
<dd>Open the file for reading and writing. If the file doesn't exist, throw an exception.</dd>
</dl>

The modes can be combined using a bitwise OR: `( READ | WRITE )`.

You may write characters, lines, Base64-encoded text and images to the stream, using the different `writeX()` methods of the `FileStream` object.

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).
