/**
 *  @fileoverview
 *  Libraries loader
 *
 *  walk the subfolders of /application/libraries/ and /application/libraries/<libName>/plugins/ ( svn:externals )  in parse a manifest file declaring the id, scripts and dependencies of the library or plugin. Which gives the following overall file structure to your Unite Service:
 *
 *  /config.xml
 *  /index.html
 *  /libraries/
 *  /libraries/foo/
 *  /libraries/foo/setup.xml
 *  /libraries/foo/pi.js
 *  /libraries/foo/pa.js
 *  /libraries/foo/plugins/
 *  /libraries/foo/plugins/baz/
 *  /libraries/foo/plugins/baz/setup.xml
 *  /libraries/foo/plugins/baz/po.js
 *  /libraries/bar/
 *  /libraries/bar/setup.xml
 *  /libraries/bar/pu.js
 *
 *  The manifest files, setup.xml, have the following syntax:
 *
 *  <setup id="timer">
 *  	<script >timer.js</ script>
 *
 *  	<depend>json</depend>
 *  	<depend>pso</depend>
 *  </setup>
 *
 *
 *  @author Mathieu 'p01' Henri, Opera Software ASA (p01@opera.com)
 *  @version 0.1
 *
 */
var Libraries = new function()
{
    var _config = {};
    _config.librariesFolder = 'libraries';
    _config.pluginsFolder   = 'plugins';
    _config.setupFile       = 'setup.xml';
    _config.errorType       = 'LIBRARY LOADER';


    var _mountpoint         = opera.io.filesystem.mountSystemDirectory( 'application' );

    var _libs               = {};
    var _blocks             = {};

    var _sortedLibs         = [];
    var _sortedScripts      = [];

    var _entangledLibraries = true;

    var _pseudoOrder        = {};
    var _pseudoOrder        =
    {
        head    : [],
        tail    : [],
        pivot   : 0,
        count   : 0,
        list    : {}
    }


    /**
     *  _setPartialPseudoOrder
     */
    function _setPartialPseudoOrder( part, args )
    {
        //  reset part
        part.length = 0;

        //  push arguments to the part
        for( var i=0; i<args.length; i++ )
        {
            var s = args[i];
            if( typeof(s)==='string' && (s=s.replace( /^\s+|\s+$/g, '' ))!=='' )
            {
                part.push( s );
            }
        }

        //  reset _pseudoOrder.list & pivot
        var index           = 0;
        _pseudoOrder.list   = {};
        for( var i=0, id; id=_pseudoOrder.head[i++]; )
        {
            _pseudoOrder.list[ id ] = index++;
        }
        _pseudoOrder.pivot  = index++;
        for( var i=0, id; id=_pseudoOrder.tail[i]; i++ )
        {
            _pseudoOrder.list[ id ] = index++;
        }
        _pseudoOrder.count  = index;

        //  return
        return part.length;
    }

    /**
     *  setHead
     */
    this.setHead = function()
    {
        return _setPartialPseudoOrder( _pseudoOrder.head, arguments );
    }
    /**
     *  setTail
     */
    this.setTail = function()
    {
        return _setPartialPseudoOrder( _pseudoOrder.tail, arguments );
    }

    /**
     *  presort the libraries
     */
    function _preSortLibraries()
    {
        //  map _libs onto a tmp array
        var tmp   = [];
        for( var k in _libs )
        {
            tmp.push( _copyObject( _libs[k] ) );
        }

        //  sort the array
        tmp.sort( function(a,b){ return a.order-b.order; } );

        //  map the array back onto _libs
        _libs   = {};
        tmp.map( function( e ){ _libs[ e.id ] = _copyObject( e ); } );
        tmp     = null;
    }

    /**
     *  init
     */
    this.load = function()
    {
        if( !_mountpoint )
        {
            throw { name:_config.errorType, message:'Could not mount the system directory' };
        }

        _walkFolder( _mountpoint, _config.librariesFolder );
        _preSortLibraries();
        _pruneList();


        if( _entangledLibraries )
        {
            //  the libraries remain entangled -> throw the list of processed & remained libraries
            var tmp = [];
            for( var k in _libs )
            {
                var output = '\t'+k
                    +'\n\t\tPATH:\t\t'+ (_libs[k].path||'')
                    +'\n\t\tPLUGIN_OF:\t'+ (_libs[k].isPluginOf||'')
                    +'\n\t\tSCRIPTS:\t'+ (_libs[k].scripts||'')
                    +'\n\t\tBLOCK:\t\t'+ (_blocks[k]||'')
                    +'\n\t\tREQUIRE:\t'+ (_libs[k].dependencies||'');
                tmp.push( output );
            }

            throw { name:_config.errorType, message:'CYCLIC DEPENDENCY OR MISSING LIBRARY/PLUGIN\n \nPROCESSED LIBRARIES:\n \n\t'+ _sortedLibs.join('\n\t') +'\n \nREMAINING LIBRARIES:\n \n'+ tmp.join('\n \n') +'\n \n' };
        }

        //  load the scripts
        _loadScripts();

        //  expose the list of libraries on the singleton
        var list = {};
        _sortedLibs.map
        (
            function( v, i )
            {
                v.index         = i;
                list[ v.id ]    = v;
            }
        )
        this.array  = _sortedLibs
        this.list   = list;

        _nukePublicMethods.call(this);
    }


    /**
     *  nuke the public methods
     */
    function _nukePublicMethods()
    {
        for( var k in this )
        {
            if( typeof(this[k])==='function' )
            {
                this[k] = null;
                delete  this[k];
            }
        }
    }


    /**
     *  copy an object
     */
    function _copyObject( o )
    {
        var t = {};
        for( var k in o )
        {
            t[k] = o[k];
        }
        return t;
    }

    /**
     *  walk folder
     */
    function _walkFolder( baseFolder, folderPath, parentId )
    {
        var walkingForLibraries = folderPath===_config.librariesFolder;
        var parentId                = parentId||'';

        //  resolve the folder
        var folders = baseFolder.resolve( folderPath );
        if( folders.exists!==true )
        {
            return false;
        }

        folders.refresh();

//        // TEST:    randomize the original list to see if the dependencies are respected
//        folders = Array.prototype.sort.call( folders, function(){ return Math.random()-.5; } );

        //  walk the _config.librariesFolder
        for( var i=0, folder; folder=folders[i]; i++ )
        {
            var lib=false;
            if( folder.isDirectory===true && folder.name[0]!=='.' && (lib=_parseSetupFile( folder, parentId ))!==null )
            {
                //  found a directory that do not start by '.' and containing a valid setupFile
                if( walkingForLibraries )
                {
                    _walkFolder( folder, _config.pluginsFolder, lib.id );
                }

                _libs[lib.id]   = lib;
            }
        }
    }


    /**
     *  parse setup file
     */
    function _parseSetupFile( folder, parentId )
    {
        var setupFileStream;
        if( folder.resolve(  _config.setupFile ).exists!==true || !( setupFileStream=folder.open( _config.setupFile, 'r' ) ) )
        {
            //  _config.setupFile does not exists or can not be opened
            return null;
        }

        //  load setupFileStream as XML and get its documentElement
        var setupText   = setupFileStream.read( setupFileStream.bytesAvailable );
        var setup       = new DOMParser().parseFromString( '<?xml version="1.0"?>\n'+setupText, 'text/xml' ).documentElement;
        setupFileStream.close();

        //  get the id
        var id      = (parentId?parentId+'.':'')+setup.getAttribute('id');

        //  build lib object
        var lib     =
        {
            'id'            :id,
            'path'          :folder.path,
            'order'         :id in _pseudoOrder.list?_pseudoOrder.list[id]:_pseudoOrder.pivot,

            'scripts'       :[],
            'dependencies'  :[]
        };

        //  parentId -> preffix the id and add a dependence on the parent
        if( parentId )
        {
            lib.isPluginOf  = parentId;
            var tag = document.createElement('depend');
            tag.textContent = parentId;
            setup.insertBefore( tag, setup.firstChild );
        }

        //  list and populate the list of scripts
        var tags    = setup.getElementsByTagName('script');
        for( var j=0, tag; tag=tags[j]; j++ )
        {
            var name    = tag.textContent.replace( /^\s+|\s+$/g, '' )
            lib.scripts.push( name );
        }

        //  list and populate the list of depends
        var tags = setup.getElementsByTagName('depend');
        for( var j=0, tag; tag=tags[j]; j++ )
        {
            var name    = tag.textContent.replace( /^\s+|\s+$/g, '' )
            lib.dependencies.push( name );
            if( _blocks[name]===undefined )
            {
                _blocks[name]   = [];
            }
            _blocks[name].push( id );
        }
        lib.dependsOn   = _copyObject( lib.dependencies );


        return lib;
    }


    /**
     *  prune the list of _libs
     */
    function _pruneList()
    {
        do
        {
            //  check depencies for missing libraries
            var unlocked        = false;
            _entangledLibraries = false;
            for( var libId in _libs )
            {
                if( _libs[libId].dependencies.length!==0 )
                {
                    //  some dependencies: the libraries remain entangled
                    _entangledLibraries = true;
                }
                else
                {
                    //  no dependencies: one library unlocked -> push it and its scripts
                    unlocked    = true;
                    var libCopy = _copyObject( _libs[libId] );
                    delete libCopy.dependencies;
                    _sortedLibs.push( libCopy );
                    _libs[libId].scripts.map
                    (
                        function( e )
                        {
                            var r = _libs[libId].path+'/'+e;
                            _sortedScripts.push( r );
                            return r;
                        }
                    );

                    //  prune it from the depencies
                    if( _blocks[libId]!==undefined )
                    {
                        for( var i=0, blocked; blocked=_blocks[libId][i]; i++ )
                        {
                            if( _libs[blocked]!==undefined )
                            {
                                for( j=_libs[blocked].dependencies.length; j--; )
                                {
                                    if( _libs[blocked].dependencies[j]===libId )
                                    {
                                        _libs[blocked].dependencies.splice( j+1 );
                                    }
                                }
                            }
                        }
                    }

                    //  prune it from the list
                    _libs[libId]    = null;
                    delete _libs[libId];
                }
            }

            //  contine until nothing gets unlocked
        }
        while( unlocked );
    }


    /**
     *  load the scripts
     */
    function _loadScripts()
    {
        var fragment    = document.createDocumentFragment();
        _sortedScripts.map
        (
            function( value )
            {
                var script  = document.createElement( 'script' );
                script.setAttribute( 'src', value );
                fragment.appendChild( script );
            }
        );
        document.documentElement.appendChild( fragment );
    }


}();