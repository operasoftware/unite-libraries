/**
@fileoverview
<h3>File IO API</h3>

<p>This API document describes the JavaScript bindings for accessing
the local file system in Opera.</p>

<h4>The basics</h4>

<p>The File I/O API consists of three classes: <code>FileSystem</code>, <code>File</code> and <code>FileStream</code>.</p>

<p>The <code>FileSystem</code> class is initialized as a singleton, and is available as <code>opera.io.filesystem</code>.
This is a virtual file system. In order to actually use it, you'll need to add directories
from your actual file system as mount points to the virtual filesystem.</p>

<p>The <code>File</code> object works like similar objects in other frameworks. It can point to a directory,
archive or regular file. It exposes properties like <code>path</code>, <code>isDirectory</code>, <code>exists</code>, 
<code>parent</code>, etc. It also works as an array to let you access files and subdirectories in a directory.</p>

<p>The <code>FileStream</code> is used when you want to read from or write to the files in the filesystem.
It supports reading and writing text, images, binary data and Base64 text.</p>

<h4>Enabling File I/O</h4>

<p>In order to make the file system and its methods available, you need to add a <code>feature</code> element to your config.xml file like this:</p>

<pre><code>&lt;widget&gt;
  ...
  &lt;feature name="http://xmlns.opera.com/fileio"&gt;
    &lt;param name="folderhint" value="home" /&gt;
  &lt;/feature&gt;
  ...
&lt;/widget&gt;</code></pre>

<p>The <code>folderhint</code> parameter is used in conjunction with the <a href="#shared">shared folder</a>. If the parameter is present, the user will be presented with a file dialogue that defaults to a directory corresponding to the value of the parameter. If multiple <code>folderhint</code> parameters are present, and the implementation supports only one shared folder, the last is used. If the parameter values do not correspond to a directory, the system will use its default starting location for the file dialogue.</p>

<p>If no <code>folderhint</code> parameter is present, no dialogue will be presented to the user and no shared folder will be available.</p>

<p>The following folder hints are recognized:</p>

<dl>
<dt>home</dt><dd>The user's default home directory, or other appropriate directory (My documents on Windows, /home/username/ on Linux, /Users/username/ on Mac)</dd>
<dt>pictures</dt><dd>The user's default pictures directory</dd>
<dt>music</dt><dd>The user's default music directory, such as /home/username/Documents/My Videos on Ubuntu)</dd>
<dt>video</dt><dd>The user's default video directory</dd>
<dt>documents</dt><dd>The user's default documents directory ( such as /home/username/Documents on Ubuntu)</dd>
<dt>downloads</dt><dd>If the user has a default downloads directory</dd>
<dt>desktop</dt><dd>The desktop, where applicable.</dd>
</dl>

<p>You may compress multiple <code>param</code> elements to <code>value="home music pictures"</code>.</p>

<p><em>The following method is deprecated:</em> In order to make the file system and its methods available, you need to add a <code>file</code> attribute with the value <code>yes</code> to the <code>widget</code> element in the config.xml file of your Opera Widget or Opera Unite Application.</p>

<h4>Mount points</h4>

<p>Instead of accessing the file system directly, this API uses a concept of mount points. In order to access 
parts of a disk, it must first be mounted as a mount point in a virtual filesystem. There are two types of mount points:</p>

<ul>
  <li>Predefined <strong>system mount points</strong> activated by the {@link opera.io.filesystem#mountSystemDirectory} method.</li>
  <li><strong>General mount points</strong> created from anywhere on the user's disk, using the {@link opera.io.filesystem#browseForDirectory} and {@link opera.io.filesystem#browseForFile} methods.</li>
</ul>

<h5>System mountpoints: the application, storage and shared directories</h5>

<p>There are three special directories you can use with the File I/O API:</p>

<ul>
  <li>The <strong>application</strong> directory, which contains the actual files in the application accessing the 
file system. If the application is a widget, this directory will contain all the files in the widget, like config.xml, 
index.html and others. This directory is always mounted as readonly.</li>
  <li>The private <strong>storage</strong> directory, which can be used to save temporary files and configuration 
information specific to the application. The files stored in this directory persist until the application is uninstalled.</li>
  <li id="shared">The private <strong>shared</strong> directory, which can be used to share and store files. This directory is typically chosen by the user when installing the application, and is accessible to the user in the normal file system. One example of use is sharing a set of images from somewhere on the user's disk.</li>
</ul>

<p>These are not available by default and need to be mounted using the {@link opera.io.filesystem#mountSystemDirectory}.
method:</p>

<pre><code>opera.io.filesystem.mountSystemDirectory('shared');
opera.io.filesystem.mountSystemDirectory('storage','myCoolSaves');</code></pre>

<p>Once mounted, they become available under in the <code>opera.io.filesystem.mountPoints</code> property.</p>

<p>You may specify an optional name to mount these directories as. If not supplied, it defaults to <code>application</code>, <code>storage</code> and <code>shared</code> respectively.</p>

<p>In the example above shared directory will be mounted as <code>shared</code> and have a path <code>/shared</code>,
while storage will be mounted as <code>myCoolSaves</code> and have a path <code>/myCoolSaves</code>.</p>

<p>These can then be accessed as regular mount points and through the mountpoint URL protocol as other mounted files, except that the <code>application</code> directory is mounted as read-only.</p>

<p class="warning" style="color: red">WARNING: The <code>shared</code> directory will be read-write, unless the underlying 
file system defines it to be read-only. Be careful to protect your data by controlling how data gets written to it. You 
should supply some sort of authentication of users who access data in this folder and be careful to not leave code open to exploitation.</p>

<h5>Creating your own mount points</h5>

<p class="note">Note: Creating mount points with the <code>browseFor*</code> methods is not supported in Opera Unite Applications. It should be possible for Opera Widgets. Mounting system mount points should work in both cases.</p>

<p>It is possible to create your own mount points from any directory on the user's disk, using the {@link opera.io.filesystem#browseForDirectory}, {@link opera.io.filesystem#browseForFile} and {@link opera.io.filesystem#browseForSave} methods.</p>

<p>These functions will open a file dialog, and let the user choose a file to share. The
selected file is returned as an argument to a callback function. If the user cancels the
dialog, or the selected file is somehow invalid, the callback function is called with
null.</p>

<p class="warning" style="color: red">WARNING: Once mounted, the mount point will be read-write unless the 
underlying file system defines it to be read-only. Be careful to protect your data by controlling how data
gets written to them. You should supply some sort of authentication of users who access these directories 
and be careful to not leave code open to exploitation.</p>

<p>The following is an example using <code>browseForDirectory()</code>, which is the most common case:</p>
 
<pre><code>opera.io.filesystem.browseForDirectory( 'share', '', processDir ); //Let the user choose a directory
function processDir( dir )
{
    if ( ! dir )
    {
        return; //Invalid file or canceled dialog
    }
    opera.postError(dir.path);
}</code></pre>
 
<p>In this case, 'share'; becomes the name of the directory in the virtual file system. The <code>processDir</code> function is called with the file the user selects.</p>

<p>Mount points become available in the <code>opera.io.filesystem.mountPoints</code> property. This object is a <code>File</code> 
object.</p>

<h5>The mountpoint URL protocol</h5>

<p>In some cases, you want your application to be able to reference files
that have been mounted in the virtual file system from a Web page. You can use the mountpoint URL protocol
for this purpose. A mountpoint URL starts with <code>mountpoint://</code>, followed by the name of a mount point
and a path to a file under that mount point.</p>

<p>For example, if a user has added a mount point, and named it <code>myImages</code> using the call:</p>

<pre><code>browseForDirectory("myImages","",callback_function);</code></pre>

<p>the user can access files inside the mount point by creating an absolute URI:</p>

<pre><code>&lt;img src="mountpoint://myImages/avatar.png"&gt;</code></pre>

<h4>Paths</h4>

<p>Note that the path separator is always <code>'/'</code>, regardless of the underlying file system.</p>

<p>The <code>fileSystem.mountPoints</code> property represents the root of the file system and has the path <code>'/'</code>.</p>

<p>A mount point mounted with the name foo has the path <code>'/foo'</code>.</p>

<p>All files belong to only one mount point, so if a directory mounted as <code>'foo'</code> has a file called 
<code>'bar'</code>, the path of the file is <code>'/foo/bar'</code>.</p>

<p>Paths that begin with <code>'/'</code> are absolute paths, starting from the root and moving down through a 
mount point, through any subdirectories and potentially to a file.</p>

<p>You may use relative paths. Any path not starting with a '/' is a relative path. The '.' and '..' directory references
are supported. Paths are relative to the current directory. If <code>file</code> is a regular file, and you call 
<code>file.moveTo('some/path')</code> or similar methods, the path is relative to the parent directory of <code>file</code>. 
If <code>file</code> is a directory, the path is relative to that directory.</p>

<h4>Working with files</h4>

<p>You obtain an initial file by adding a mount point as described earlier. From here you have two options:</p>

<p>If the mount point is a directory, you can move into its content as described in the next section.</p>

<p>You can use the <code>resolve()</code> method on the initial <code>File</code> object to get a reference to a File
somewhere under the mount point. This method takes a path as an argument and will attempt to resolve it. If
the path is valid, an <code>File</code> object is returned. Note that the file does not need to exist; the path simply needs to be a possible valid path.</p>

<pre><code>var file = mp.resolve('path/to/my/file');</code></pre>

<p>Note that the path separator is always '/', regardless of the underlying file system.</p>

<p>Some important properties of the <code>File</code> object:</p>

<dl>
<dt>exists</dt><dd>Check if the file referenced by this <code>File</code> object actually exists. Especially useful when using the <code>resolve()</code> method.</dd>
<dt>isFile</dt><dd>If the <code>File</code> object references a regular file.</dd>
<dt>isDirectory</dt><dd>If the <code>File</code> object references a directory.</dd>
<dt>created</dt><dd>When the file was created.</dd>
<dt>modified</dt><dd>When the file was last modified.</dd>
<dt>path</dt><dd>The path to this file in the virtual file system, starting with '/' and the name of the mount point.</dd>
</dl>

<p>You may copy and move files by using the <code>copy</code> and <code>moveTo</code> methods:</p>

<pre><code>file.copyTo('path/to/copy');
file.moveTo('new/name/of/file');</code></pre>

<p>Both methods take an optional argument <code>overwrite</code>, which will cause any existing files with the new path to be overwritten.</p>

<p>To create a new directory, use the following syntax:</p>

<pre><code>var file = mountPoint.createDirectory(somePath);
var file = mountPoint.createDirectory(mountPoint.resolve(somePath));</code></pre>

<p>In order to write files, you need to open a <code>FileStream</code> to the file and write to it. See the section on <a href="#stream">working with streams</a>.</p>

<p>To delete files or directories, use the <code>deleteFile()</code> or <code>deleteDirectory()</code> methods:</p>

<pre><code>mp.deleteFile('path/to/file');
mp.deleteDirectory('path/to/directory', true);</code></pre>

<p>Both methods may take a <code>File</code> object instead of a path. The second argument is to delete content recursively</p>

<h4>Working with directories</h4>

<p>A <code>File</code> object made from a directory points to its subdirectories and contained files.
The <code>File</code> object supports a <code>length</code> property and an array-like syntax to access these subfiles.
Note that the subfiles and directories need to be 'refreshed' before you can actually access
them. Through this process, information about the files in the directory are loaded into the virtual
filesystem. The method <code>refresh()</code> is used for this purpose:</p>

<pre><code>dir.refresh(); //Load the contents of the directory
for ( var i = 0, file; file = dir[i]; i++ )
{
    opera.postError(file.path + ' ' + file.isDirectory + ' ' file.isFile);
}</code></pre>

<p>When the file is a directory, its <code>length</code> property will tell you how many files and subdirectories there are in the directory.</p>

<p>It's important to note that information about the subfiles and directories of this directory is
<strong>not live</strong>. If files are added, moved or deleted, you need to call <code>refresh()</code> again to update
the information in the <code>File</code> object.</p>

<p>You can similarly recurse through the file structure.</p>

<h4 id="stream">Reading and writing: Working with files streams</h4>

<p>In order to read or write to a file, you need to make a <code>File</code> object and then open it for reading or writing 
using the <code>open</code> method:</p>

<pre><code>var stream = dir.open('newfile', opera.io.filemode.WRITE);
stream.writeLine('hello');
stream.close();
stream = dir.open('newfile');
var data = stream.readLine();
opera.postError(data);</code></pre>

<p>Using <code>opera.io.filemode.WRITE</code> will overwrite all data in the file. Use <code>opera.io.filemode.APPEND</code> to append data instead. If the file does not exist, it is immediately created when opened in either of these modes.</p>

<p>The following modes are supported:</p>

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

<p>The modes can be combined using a bitwise OR: <code>( READ | WRITE )</code>.</p>

<p>You may write characters, lines, Base64-encoded text and images to the stream, using the different <code>writeX()</code> methods of the <code>FileStream</code> object.</p>

@author Hans S. Toemmerholt, Web Applications, Opera Software ASA
*/

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * File mode constants that can be used with {@link File#open}
 */
opera.io.filemode = function ()
{

    /**
     * Open the file for reading. The value of the constant is 1.
     * @type int
     */
    this.READ = 1;


    /**
     * Open the file for writing.
     *
     * <p>This will empty the file first. If the File does not exist, it is immediately created.</p>
     *
     * <p>The value of the constant is 2.</p>
     * 
     * @type int
     */
    this.WRITE = 2;

    /**
     * Open the file for appending.
     *
     * <p>This will preserve the contents of the file and write from the end of the file. If the File does not exist, it is immediately created.</p>
     *
     * <p>The value of the constant is 4.</p>
     *
     * @type int
     */
    this.APPEND = 4;


    /**
     * Open the file for reading and writing. This is equivalent to r+. The value of the constant is 8.
     * @type int
     */
    this.UPDATE = 8;

}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Virtual file system implementation
 *
 * <p>The <code>FileSystem</code> class represents a virtual file system. Actual files are
 * connected to it by defining mount points from the actual file system. This
 * way file system access can be limited to a selected set of files rather
 * than allow unsecure operations on the local file system directly.</p>
 *
 * <p>Path references in the virtual file systems always use '/' as the path separator.</p>
 *
 */
opera.io.filesystem = function ()
{

    /**
     * The mount points currently attached to this <code>FileSystem</code>. Readonly.
     *
     * This is a special <code>File</code> object that represents the root of the virtual file
     * system and serves to enumerate the existing mount points. Its path is
     * <code>/</code> and its name is empty. If you mount a directory as <code>foo</code>, the path
     * of the mount point is <code>/foo</code>.
     *
     * @see File
     * @type File
     */
    this.mountPoints =  {};

    /**
     * Mount application or storage system directory.
     *
     * <p>Applications that use the File I/O API have access to three special directories:</p>
     *
     * <dl>
     *   <dt>application</dt>
     *   <dd>The application directory contains the actual files and directories of
     * the current application accessing the API. For widgets, for example, the config.xml
     * and index.html and other files of the widget are found here. This directory is
     * mounted as readonly.</dd>
     *   <dt>storage</dt>
     *   <dd>The storage directory is for storing temporary files and configuration files specific
     * to the application, for example uploaded files. This directory and its contents are persisted until
     * the application is uninstalled.</dd>
     *   <dt>shared</dt>
     *   <dd>The shared directory is for sharing data from the regular file system. The directory 
     * is typically selected by the user when installing the application.</dd>
     *
     * </dl>
     *
     * <p>These directories of the application are not mounted by default. You need to call this
     * method to mount and use them. Once mounted, they are available through the 
     * <code>mountPoints</code> property like other mount points. Files and directories under them 
     * can be accessed by resolving and using the mountpoint URL protocol as for normal 
     * files.</p>
     *
     * <p>The application directory is always mounted as readonly.</p>
     *
     * <p>If you do not supply the <code>name</code> argument, the <code>location</code> argument is used as the name
     * of the mount point. They are then available as the mount points <code>storage</code>, 
     * <code>application</code> and <code>shared</code>, with paths <code>/storage</code>, <code>/application</code> and <code>/shared</code> respectively.</p>
     *
     * <p>Note that the <code>shared</code> is mounted as read-write unless the underlying file system
     * defines it to be read-only. You should take care to protect your data by limiting access and
     * checking for exploitable code.</p>
     *
     * @param {String} location Name of the system directory to mount, either <code>storage</code>, <code>application</code> or <code>shared</code>.
     * @param {String} name Name to mount the directory as. If not present, the location is used. Optional.
     * @returns {File} <code>File</code> object representing the mounted system directory, or null if the location is invalid or if the system directory is not defined.
     */
    this.mountSystemDirectory = function ( location, name ) { ; }

    /**
     * Remove the given mount point.
     *
     * Removes a mount point from the virtual file system, either by referencing its symbolic name or by passing a 
     * <code>File</code> object representing the mount point. If the mount point is mounted as persistent, removing it will also
     * remove the persistance.
     *
     * @param {File} mountpoint <code>File</code> object representing the mount point or a String with the name of the mount point.
     * @throws GENERIC_ERR If the given File or String doesn't represent a mount point.
     */
    this.removeMountPoint = function ( mountpoint ) { ; }

    /**
     * Open a dialog allowing the user to browse for a directory to mount.
     *
     * <p class="note">Note that this method is not supported for Opera Unite applications.</p>
     *
     * <p>Calling this function will open a file chooser dialog showing only directories. When the user 
     * selects one, the directory is mounted and the given <code>callback</code> is called with a <code>File</code> object 
     * representing the directory. If the user cancels the dialog, or if mounting fails, the callback 
     * is called with a null argument.</p>
     *
     * <p>Mount points are by default destroyed whenever the application is closed. If you give the <code>persistent</code>
     * argument as <code>true</code>, the mount point will be remounted the next time the application is started.</p>
     *
     * <p>The <code>defaultlocation</code> argument is used to specify the initial directory of the dialog.</p>
     *
     * <p>This function will only be called as a result of direct user interaction, such as a click event or similar. If
     * called from a timeout or a programatically dispatched event, it will be ignored by the runtime.</p>
     *
     * <p>Mount points are mounted as read-write, so you should take care to protect your data by limiting user's access to it.</p>
     *
     * @param {String} name The name of the mount point to create.
     * @param {String} defaultlocation Location in the file system the dialog should open with. Leave blank for system default.
     * @param {Function} callback Function to call when the user has selected a directory.
     * @param {boolean} persistent Whether or not this mount point should be remounted if the application restarted. Optional. Defaults to false.
     * @throws GENERIC_ERR if the type of the name argument is wrong, if it contains invalid characters for a mount point name, or if the given mount point is already in use.
     */
    this.browseForDirectory = function ( name, defaultlocation, callback, persistent ) { ; }

    /**
     * Open a dialog allowing the user to browse for a file to mount.
     *
     * <p class="note">Note that this method is not supported for Opera Unite applications.</p>
     *
     * <p>Calling this function will open a file chooser dialog. When the user selects a file, the file is mounted and the given 
     * <code>callback</code> is called with a corresponding <code>File</code> object. If the user cancels the dialog, or if mounting fails, 
     * the callback is called with a null argument.</p>
     *
     * <p>Mount points are by default destroyed whenever the application is closed. If you give the <code>persistent</code>
     * argument as <code>true</code>, the mount point will be remounted the next time the application is started.</p>
     *
     * <p>The appearance of the dialog can be manipulated with the various arguments to the method. The
     * <code>defaultlocation</code> argument is used to specify the initial directory of the dialog. The 
     * <code>multiple</code> argument is used to control whether or not the user can select multiple files.
     * The <code>filter</code> can be given an array of file types such as 'txt', which limits the types of the files the user 
     * can select.</p>
     * 
     * <p>If the method is called with <code>multiple</code> set to <code>true</code>, a virtual directory will be created and
     * mounted with the given name, containing the selected files. The callback will be called with the File representing the 
     * virtual directory. It is not possible to add further files to this mount point, although you can delete files already
     * in it.</p>
     * 
     * <p>This function will only be called as a result of direct user interaction, such as a click event or similar. If
     * called from a timeout or a programatically dispatched event, it will be ignored by the runtime.</p>
     *
     * <p>Mount points are mounted as read-write, so you should take care to protect your data by limiting user's access to it.</p>
     *
     * @param {String} name The name of the mount point to create.
     * @param {String} defaultlocation Location in the file system the dialog should open with. Leave blank for system default.
     * @param {Function} callback Function to call when the user selects a file in the dialog.
     * @param {boolean} persistent Whether or not this mount point should be remounted if the application restarted. Optional. Defaults to false.
     * @param {boolean} multiple Whether ot not multiple files can be chosen in the dialog. Optional. Defaults to false.
     * @param {Array} filter Array of file type extensions to filter the list of selectable file types in the dialog. Defaults to '*'. <span class="ni">Not implemented.</span>
     * @throws GENERIC_ERR if the type of the name argument is wrong, if it contains invalid characters for a mount point name, or if the given mount point is already in use.
     */
    this.browseForFile = function ( name, defaultlocation, callback, persistent, multiple, filter ) { ; }

    /**
     * Open a dialog allowing the user to create a new file, which is then mounted.
     *
     * <p class="note">Note that this method is not supported for Opera Unite applications.</p>
     *
     * <p class="ni">Currently, the selected File is just returned, but not mounted. Consequently, using <code>persistent</code> has no meaning.</p>
     *
     * <p>Calling this function will open a file chooser dialog whose start location is the location of the given mount point.
     * In this dialog the user may create a new file. A <code>File</code> object is cteated and mounted and the given callback is called with 
     * the object. If the user cancels the dialog, or if mounting fails, the callback is called with a null 
     * argument.</p>
     *
     * <p>If the file already exists, a File representing it us sent in the callback. If it doesn't exist, a <code>File</code> object
     * is returned with the <code>exists</code> property set to false. It will be physically created only after it is
     * opened.</p>
     *
     * <p>Mount points are by default destroyed whenever the application is closed. If you give the <code>persistent</code>
     * argument as <code>true</code>, the mount point will be remounted the next time the application is started.</p>
     *
     * <p>This function will only be called as a result of direct user interaction, such as a click event or similar. If
     * called from a timeout or a programatically dispatched event, it will be ignored by the runtime.</p>
     *
     * <p>Mount points are mounted as read-write, so you should take care to protect your data by limiting user's access to it.</p>
     *
     * @param {String} name The name of the mount point to create.
     * @param {String} defaultlocation Location in the file system the dialog should open with. Leave blank for system default.
     * @param {Function} callback Function to call when the user selects a file in the dialog.
     * @param {boolean} persistent Whether or not this mount point should be remounted if the application restarted. Optional.
     * @throws GENERIC_ERR if the type of the name argument is wrong, if it contains invalid characters for a mount point name, or if the given mount point is already in use.
     */
    this.browseForSave = function ( name, defaultlocation, callback, persistent ) { ; }

}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Class representing files and directories.
 *
 * <p>Objects of this class can refer to regular files, directories or archives of files. In the
 * two latter cases, the object contains references to its subdirectories and files.</p>
 *
 * <p>The <code>fileSystem.mountPoint</code> property and any mounted directories are <code>File</code> objects. You
 * may make a <code>File</code> object by calling the <code>resolve()</code> method on any of these.</p>
 *
 * <p>The <code>File</code> class is special in that it doubles as an array-like object containing the <code>File</code> objects it refers to.
 * So if, a directory contains a series of files and directories, you can do the
 * following:</p>
 *
 * <pre><code>var dir = mp.resolve('path/to/dir'); //Get a File object refering to the directory
 *dir.refresh(); //Load the contents of the directory
 *for ( var i = 0, file; file = dir[i]; i++ )
 *{
 *    opera.postError(file.name);
 *}</code></pre>
 */
var File = function ()
{

    /**
     * The parent File of this File, or null if it has no parent. Readonly.
     *
     * In most cases, the parent will be a directory. It can also be an archive. For
     * Files that are mount points, this property is <code>null</code>.
     *
     * @type File
     */
    this.parent = {};

    /**
     * Whether or not this File is read only. Readonly.
     *
     * Files mounted in the application directory, using <code>mountSystemDirectory()</code> are
     * not writeable. Otherwise, the physical file system determines whether or not
     * the File is writeable.
     *
     * @type boolean
     */
    this.readOnly =  false;

    /**
     * Whether or not this File exists in the physical file system. Readonly.
     *
     * File objects created through <code>resolve()</code> or <code>browseForSave()</code>, 
     * may in some cases not exist in the file system.
     *
     * @type boolean
     */
    this.exists =  false;

    /**
     * Whether or not this File is a regular file. Readonly.
     * @type boolean
     */
    this.isFile =  false;

    /**
     * Whether or not this File is a directory. Readonly.
     * @type boolean
     */
    this.isDirectory =  false;

    /**
     * Whether or not this File is hidden in the underlying file system. Readonly.
     * @type boolean
     */
    this.isHidden = false;

    /**
     * Whether or not this File is a compressed archive, like a zip or gzip file. Readonly.
     *
     * <p>Note that archives will also have the <code>isDirectory</code> and </code>isFile</code>
     * properties set. You may both use <code>resolve()</code> to resolve files inside the archive, or open
     * the archive file using <code>open()</code>.</p>
     *
     * <p class="ni">Currently only a subset of the ZIP format is currently supported as archives.</p>
     *
     * @type boolean
     */
    this.isArchive =  false;

    /**
     * Meta data for this file.
     *
     * This property holds meta data for special types of files, for example the file name of an uploaded
     * file. For normal files, this property is <code>null.</code>
     *
     * @type Object
     */
    this.metaData = null;

    /**
     * The time and date this File was created.
     * @type Date
     */
    this.created =  {};

    /**
     * The time and date this File was last modified.
     * @type Date
     */
    this.modified =  {};

    /**
     * The name of this File as a URL encoded String.
     *
     * <p>Anything that occurs after the last '/' in the path of this File. If the file has the path 
     * <code>/foo/bar</code>, the name is <code>bar</code>. There is no trailing path separator if
     * this File is a directory.</p>
     *
     * @type String
     */
    this.name =  '';

    /**
     * The path to this File in the virtual file system as a URL encoded String. Readonly.
     *
     * <p>The full path of this File in the virtual file system, starting with the name of the mount
     * point and including the full file name of this file or directory. There is no trailing
     * path separator if this File is a directory.</p>
     *
     * @type String
     */
    this.path =  '';

    /**
     * The path to this File in the physical file system. Readonly.
     *
     * <p>The full path of this File in the physical file system, including trailing slash or backslash
     * for directories. If you mount a directory <code>c:\foo\</code> as <code>foo</code> and this directory 
     * contains a file <code>bar.txt</code>, the <code>nativePath</code> of this File will be <code>c:\foo\bar.txt</code>.
     * Note that the path separator of the underlying operating system is used in the path.</p>
     *
     * <p>For the mount points mounted by <code>mountSystemDirectory()</code>, and for all files under them,
     * this property will be empty to avoid exposing system information to the application.</p>
     *
     * <p>This property is <strong>not</strong> URL encoded, i.e. it is not modified in any way from how
     * the underlying file system would represent the path.</p>
     *
     * @type String
     */
    this.nativePath =  '';

    /**
     * The maximum number of characters a path reference can contain. Readonly.
     *
     * This number is the maximum path length supplied by the operating system, minus
     * the length of the actual path to the file in the actual file system. If
     * <code>c:\foo\bar</code> is mounted as <code>bar</code>, and assuming
     * the operating system has a maximum path length of 128, the <code>maxPathLength</code> property
     * of the File would be 128 - 10 = 110.
     *
     * @type int
     */
    this.maxPathLength =  0;

    /**
     * The number of bytes in this File. Readonly.
     *
     * If this File is a directory, it's size is 0. Use the <code>length</code> property to find out how
     * many files the directory contains.
     *
     * @type int
     */
    this.fileSize =  0;

    /**
     * The number of files and directories referenced by this File. Readonly.
     *
     * <p>This property is used for array style lookup. If the <code>File</code> object is a regular file,
     * its length is 0. Use the <code>fileSize</code> property to get the size of regular
     * files in bytes.</p>
     *
     * <p>For directories or archives, this property is 0 until <code>refresh()</code> is called,
     * except for mount point <code>File</code> objects that are already loaded.</p>
     *
     * @type int
     */
    this.length =  0;

    /**
     * Open a File for reading or writing.
     *
     * <p>If the path argument is given as <code>null</code>, this File will be opened.</p>
     *
     * <p>The file can be opened in read, write, append or update mode, represented by the constants in {@link opera.io.filemode}.</p>
     *
     * <p>The mode argument is similar to PHPs <code>fopen()</code>, but implemented as constants which can be combined through a bitwise OR,
     * for example as <code>opera.io.filemode.APPEND | opera.io.filemode.READ</code>.
     *
     * <p>If the file does not exist when opened in WRITE or APPEND mode, it is immediately created. The entire path to the file is created if this does not exist.</p> 
     *
     * <p>If the file does not exist when opened in READ or UPDATE mode, a FILE_NOT_FOUND_ERR is thrown.</p> 
     *
     * <p class="note">The previous version of the API accepted a string equal to the ones described below. This is now deprecated 
     * in favor of the constants in {@link opera.io.filemode}.</p>
     *
     * <p>The the following is an extract from 
     * <a href="http://no2.php.net/fopen">http://no2.php.net/fopen</a> and explains possible combinations:</p>
     *
     * <p>If a file is opened in an invalid mode, for example opening a read-online file in WRITE mode, a SECURITY_ERR is thrown.</p>
     *
     * <dl>
     * <dt>'r'</dt><dd>Open for reading only; place the file pointer at the beginning of the file.</dd>
     * <dt>'r+'</dt><dd>Open for reading and writing; place the file pointer at the beginning of the file. </dd>
     * <dt>'w'</dt><dd>Open for writing only; place the file pointer at the beginning of the file and truncate the
     * file to zero length. If the file does not exist, attempt to create it.</dd>
     * <dt>'w+</dt><dd>Open for reading and writing; place the file pointer at the beginning of the file and truncate
     * the file to zero length. If the file does not exist, attempt to create it.</dd>
     * <dt>'a'</dt><dd>Open for writing only; place the file pointer at the end of the file. If the file does not
     * exist, attempt to create it.</dd>
     * <dt>'a+'</dt><dd></dd>
     * <dt></dt><dd>Open for reading and writing; place the file pointer at the end of the file. If the file does not
     * exist, attempt to create it.</dd>
     * </dl>
     *
     * <p>Note that {@link opera.io.filemode#UPDATE} represents 'r+'.</p>
     *
     * @param {File} path File object to read, or a URL encoded String with the path to the file to read.
     * @param {int} mode Whether to open the file for reading, writing, appending or a combination.
     * @returns {FileStream} A FileStream pointing to the given file, or null if no File with the given path can be resolved.
     * @throws WRONG_ARGUMENTS_ERR If the given path is not a valid File or if the mode argument is unrecognized.
     * @throws WRONG_TYPE_OF_OBJECT_ERR If the given path is not valid for opening, for example if it is a directory.
     * @throws SECURITY_ERR If opening the file is not permitted, for example if it is readonly and opened in write mode.
     * @throws FILE_NOT_FOUND_ERR If the filemode requires that a file must exist before accessing, such as READ or UPDATE, and it doesn't.
     */
    this.open = function ( path, mode ) { ; }

    /**
     * Copy this File to the given File path.
     *
     * <p>Calling this function will copy all the contents of this File to the given target location, given
     * as either a <code>File</code> object or a String containing the path.</p>
     *
     * <p>If the target location exists, this operation will fail with an exception. Use the 
     * <code>overwrite</code> argument to replace existing files in target location.</p>
     *
     * <p>Supplying the optional <code>callback</code> will make the operation asynchronous, and the function
     * will immediately return a <code>File</code> object representing the copy of the File, regardless of whether the
     * operation is complete. The callback is called when the copy operation is complete, with the copy of the
     * File as an argument. If the operation fails, the callback is called with a <code>null</code> argument.</p>
     *
     * @param {File} path The target location to copy this File to, as either a File or an URL encoded String with the path.
     * @param {boolean} overwrite Whether or not to overwrite any content present in the target path. Optional, default false.
     * @param {Function} callback Function to call when the copy is completed. Optional.
     * @returns {File} File object representing the location of the copy.
     * @throws GENERIC_ERR If the destination File already exists and the <code>overwrite</code> argument is <code>false</code>.
     */
    this.copyTo = function ( path, overwrite, callback ) { ; }

    /**
     * Move this File to the given File path.
     *
     * <p>Calling this function will move all the contents of this File to the given File target location.</p>
     *
     * <p>If the target location exists, this operation will fail with an exception. Use the 
     * <code>overwrite</code> argument to replace existing files in target location.</p>
     *
     * <p>Supplying the optional <code>callback</code> will make the operation asynchronous, and the function
     * will immediately return a <code>File</code> object representing the new File regardless of whether the
     * operation is complete. The callback is called with the new File as an argument. If the
     * operation fails, the callback is called with a <code>null</code> argument.</p>
     *
     * @param {File} path The target location to move this File to, as either a File or an URL encoded String with the path.
     * @param {boolean} overwrite Whether or not to overwrite any content present in the target path. Optional, default false.
     * @param {Function} callback Function to call when the move is competed. Optional.
     * @return {File} File object representing the location of the new file.
     * @throws GENERICL_ERR If the destination File already exists and the <code>overwrite</code> argument is <code>false</code>.
     */
    this.moveTo = function ( path, overwrite, callback ) { ; }

    /**
     * Create a new directory.
     *
     * <p>Create a new directory using either a File object or a URL encoded String with a path to the new directory. All 
     * non-existing parent directories are created along with it.</p>
     *
     * <h2>Examples:</h2>
     *
     * <pre><code>file = mountPoint.createDirectory(somePath);
     *file = mountPoint.createDirectory(mountPoint.resolve(somePath));</code></pre>
     *
     * @param {File} directory File referring to the desired directory, or a URL encoded String with the path to the directory.
     * @returns {File} File pointing to the new directory.
     * @throws GENERIC_ERR If the directory or any of its parent directories could not be created.
     */
    this.createDirectory = function ( directory ) { ; }

    /**
     * Delete the given directory.
     *
     * <p>If the <code>recursive</code> argument is given as <code>true</code>, this method will attempt to delete the
     * directory and all of its content. If deleting individual files or directories in it fails, the method will continue
     * to delete the rest of the content.</p>
     *
     * <p>If the entire directory and all of its content is deleted, the method will return <code>true</code>. If parts
     * of the content, and thus also the directory itself could not be deleted, the method will return
     * <code>false</code>.</p>
     *
     * @param {File} directory File representing the directory or a URL encoded String with the path to the directory to delete.
     * @param {boolean} recursive Whether or not to recursively delete any content references by this File. Optional, default false.
     * @returns {boolean} true if the directory and all its content was deleted, false if the directory or any part of its contents was not deleted.
     */
    this.deleteDirectory = function ( directory, recursive ) { ; }

    /**
     * Delete the given file.
     *
     * This method takes either a <code>File</code> object or a URL encoded String with a path and deletes the
     * referenced file.
     *
     * @param {File} file File representing the directory or a URL encoded String with the path to the file to delete.
     * @returns {boolean} true if the file was successfully deleted, otherwise false.
     * @throws GENERIC_ERR If the file could not be deleted.
     */
    this.deleteFile = function ( file ) { ; }

    /**
     * Refresh the content in this File.
     *
     * Initially a File representing a directory is loaded without its actual content.
     * For directories you need to call this method at least once to load the content.
     * The File is then not live, i.e. if the underlying file system changes, these
     * changes are not propagated to this <code>File</code> object. You need to call this method
     * again to see the changes.
     */
    this.refresh = function () { ; }

    /**
     * Resolve a path to a file.
     *
     * <p>This function will take a URL encoded String with a path and attempt to resolve the path.
     * If the path is valid, a <code>File</code> object representing it is returned. The File may
     * point to a non-existing file or directory, as long as the path is valid. The
     * resulting File can, for example, be used with the {@link File#createDirectory} method.</p>
     *
     * <p>If the path is invalid, i.e. pointing to something outside en existing sandbox, an
     * exception is thrown. You may resolve paths with characters that are not recommended
     * and get a File, though exceptions will typically be thrown if you attempt to read from
     * or write to such files.</p>
     *
     * @param {String} path URL encoded String with path of the file to resolve.
     * @returns {File} File resolved by the given path.
     * @throws SECURITY_ERR If the path points to something outside an existing sandbox. 
     */
    this.resolve = function ( path ) { ; }

    /**
     * String representation of this File.
     *
     * This method will return the absolute path to the File in the virtual file system, including
     * the file name as an URL encoded String.
     *
     * @returns {String} URL encoded String with the path of the File.
     */
    this.toString = function () { ; }

}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * A FileStream allows reading or writing specific parts of a File.
 *
 * <p>The <code>FileStream</code> class exposes several ways of reading from and writing to Files.
 * Examples include reading and writing bytes, strings and lines.</p>
 *
 * <p>When the <code>FileStream</code> is created a pointer is usually set at the beginning of the file.
 * As the read methods are called, the pointer moves through the file. Subsequent
 * calls to the read methods read from that point and onward. When the end of
 * the file is reached, the <code>eof</code> property is set to <code>true</code>.</p>
 *
 * <p>This class supports Base64 data for use in cases like <code>XMLHttpRequest</code>. This
 * object does not support writing binary data, so the Base64 methods can be
 * used to write binary data encoded as strings.</p>
 *
 * <p>By default, the <code>FileStream</code> object uses an UTF-8 encoding when writing. You
 * can change this by setting the <code>encoding</code> property of the <code>FileStream</code> or by
 * supplying a <code>charset</code> argument to the various methods that write characters.</p>
 *
 */
var FileStream = function ()
{

    /**
     * The current byte index position of this <code>FileStream</code>.
     *
     * You may set the position programmatically. If it is set to &lt; 0, the position will be 0.
     * If it is set to &gt; <code>fileSize</code>, the position will be <code>fileSize</code>.
     *
     * @type int
     */
    this.position = 0;

    /**
     * Number of of bytes available from the current position to the end of the <code>FileStream</code>.
     *
     * The value of this property is effectively <code>fileSize</code> - <code>position</code>.
     *
     * @type int
     */
    this.bytesAvailable = 0;

    /**
     * Whether ot not the end of the <code>FileStream</code> has been reached.
     *
     * If the <code>FileStream</code> is unreadable, this property is <code>true</code>.
     *
     * @type boolean
     */
    this.eof = false;

    /**
     * The encoding of this <code>FileStream</code>.
     *
     * This property defaults to UTF-8. Change it to override the default encoding
     * used when writing to the <code>FileStream</code>. This can be overriden on a case-by-case
     * basis by supplying the <code>charset</code> argument to the various methods 
     * which write characters.
     *
     * @type String
     */
    this.encoding =  '';

    /**
     * The system default character for separating lines in a file. Readonly.
     * @type String
     */
    this.systemNewLine = '';

    /**
     * Newline character used for this particular <code>FileStream</code>.
     *
     * This is the same as {@link #systemNewLine} when the <code>FileStream</code> is created.
     * This can be set to override the default character used for splitting lines when calling 
     * {@link readLine()} or {@link writeLine()}.
     *
     * @type String
     */
    this.newLine = '';

    /**
     * Close the <code>FileStream</code> for reading or writing.
     */
    this.close = function (  ) { ; }

    /**
     * Read a number of characters from the FileStream.
     *
     * <p>This function will read <em><code>length</code></em> number 
     * of characters from the stream.</p>
     *
     * <p>If there are less than <em><code>length</code></em> characters left
     * in the file, only the remaining characters in the file are
     * read, and the <code>eof</code> property is set to <code>true</code>.</p>
     *
     * <p>If <code>eof</code> is <code>true</code> when this method is called,
     * null will be returned.</p>
     *
     * <p>The resulting String is encoded with the charset in the 
     * <code>FileStream.encoding</code> property unless the optional <code>charset</code>
     * argument is given.
     *
     * @param {int} length Number of characters to read.
     * @param {String} charset The character set to use when reading.
     * @returns {String} A String of characters, or null if there are no more characters left in the File.
     * @throws GENERIC_ERR If it is not possible to read from the stream.
     */
    this.read = function ( length, charset ) { ; }

    /**
     * Read a line of characters from the <code>FileStream</code>
     *
     * <p>This functions will read all characters up to and including the next 
     * newline in the <code>FileStream</code> as defined by the {@link #newLine} property. 
     * If there are no newlines left in the stream, the resulting string will 
     * not have a newline character and the <code>eof</code> property is set 
     * to <code>true</code>.</p>
     *
     * <p>If <code>eof</code> is <code>true</code> when this method is called,
     * null is returned.</p>
     *
     * <p>The resulting String is encoded with the charset in the 
     * <code>FileStream.encoding</code> property unless the optional charset
     * argument is given.
     *
     * @param {String} charset The character set to use when reading. Optional.
     * @returns {String} A String of characters, or null if there are no data to read.
     * @throws GENERIC_ERR If it is not possible to read from the stream.
     */
    this.readLine = function ( charset ) { ; }

    /**
     * Read a number of bytes from the <code>FileStream</code>
     *
     * <p>This function will read <em><code>length</code></em> number 
     * of bytes from the <code>FileStream</code>.</p>
     *
     * <p>If there are less than <em><code>length</code></em> bytes left
     * in the file, only the remaining bytes in the file are
     * read, and the <code>eof</code> property is set to <code>true</code>.</p>
     *
     * <p>If <code>eof</code> is <code>true</code> when this method is called,
     * null will be returned.</p>
     *
     * @param {int} length The number of bytes to read.
     * @returns {ByteArray} A ByteArray with the bytes read from the FileStream, or null if there are no data to read.
     * @throws GENERIC_ERR If it is not possible to read from the stream.
     */
    this.readBytes = function ( length ) { ; }

    /**
     * Read bytes from the <code>FileStream</code> and encode it as Base64
     *
     * <p>This method will read <code>length</code> number of
     * bytes from the <code>FileStream</code> and return the data as a Base64 
     * encoded String.</p>
     *
     * <p>This is typically used to encode data from binary files 
     * in order to transfer them for example over <code>XMLHttpRequest</code>.</p>
     *
     * <p>As the method will read a number of bytes as specified
     * in the length argument, and then encode it, a call to 
     * <code>stream.readBase64(100)</code> will not necessarily end 
     * up as a String with a length of 100.</p>
     *
     * <p>If there are less than <em><code>length</code></em> bytes left
     * in the file, only the remaining bytes in the file are
     * read, and the <code>eof</code> property is set to <code>true</code>.</p>
     *
     * <p>If <code>eof</code> is <code>true</code> when this method is called,
     * null will be returned.</p>
     *
     * @param {int} length Number of bytes to read.
     * @returns {String} The content of the <code>FileStream</code> as a Base64 encoded String, or null if there are no data to read.
     * @throws GENERIC_ERR If it is not possible to read from the stream.
     */
    this.readBase64 = function ( length ) { ; }

    /**
     * Write a string of characters to the <code>FileStream</code>
     *
     * This method will write the given String of characters to the <code>FileStream</code>, using
     * the given <code>charset</code> or the charset in the <code>FileStream.encoding</code> property.
     *
     * <p class="ni">The <code>charset</code> argument is currently ignored.</p>
     *
     * @param {String} string The String of characters to write.
     * @param {String} charset The charset to use when writing. Optional.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.write = function ( string, charset ) { ; }

    /**
     * Write a line of characters to the FileStream
     *
     * <p>This method will write the given String with an appended newline character taken from
     * the {@link #newLine} property to the <code>FileStream</code>, using the given charset or the charset 
     * in the <code>FileStream.encoding</code> property.</p>
     *
     * <p class="ni">The <code>charset</code> argument is currently ignored.</p>
     *
     * @param {String} string The string of characters to write.
     * @param {String} charset The <code>charset</code> to use when writing. Optional.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.writeLine = function ( string, charset ) { ; }

    /**
     * Write a set of bytes to the <code>FileStream</code>
     *
     * This method will write the <em><code>length</code></em> first bytes
     * from the given <code>ByteArray</code> to the stream.
     *
     * @param {ByteArray} bytes The bytes to write.
     * @param {int} length The number of bytes to write.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.writeBytes = function ( bytes, length ) { ; }

    /**
     * Decode a Base64 encoded string and write the data to the <code>FileStream</code>.
     *
     * This method takes a String encoded as Base64, decodes it and writes
     * the resulting data to the <code>FileStream</code>. It is typically used for
     * binary data encoded as Base64 when its transferred for example
     * over <code>XMLHttpRequest</code>.
     *
     * @param {String} string Base64 encoded String to write.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.writeBase64 = function ( string ) { ; }

    /**
     * Write a File to the <code>FileStream</code>.
     *
     * This will write the entire contents of the given File
     * to the <code>FileStream</code>.
     *
     * @param {File} file The File to write.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.writeFile = function ( file ) { ; }

    /**
     * Write an image to the <code>FileStream</code>.
     *
     * This function will take either an <code>HTMLImageElement</code> or an <code>HTMLCanvasElement</code>
     * and write the binary data to the <code>FileStream</code>. In the case of <code>HTMLCanvasElement</code>,
     * the image is first encoded as a PNG image.
     *
     * @param {HTMLImageElement} image The <code>HTMLImageElement</code> or <code>HTMLCanvasElement</code> to write.
     * @throws GENERIC_ERR If it is not possible to write to the stream.
     */
    this.writeImage = function ( image ) { ; }

}

