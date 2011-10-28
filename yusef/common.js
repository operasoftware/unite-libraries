/**
 *  Curry the function with some arguments.
 *
 *  @return {Function}  The curried function.
 */
Function.prototype.curry = function()
{
    var method  = this,
        args    = [].concat( arguments );
    return function()
    {
        return method.apply( this, args.concat( arguments ) );
    }
}


/**
 *  Bind the function to an object.
 *
 *  @param  {Object}    object  The object on which the function will be bound.
 *  @return {Function}  The function bound to object.
 */
Function.prototype.bind = function( object )
{
    var method = this;
    return function ()
    {
        return method.apply( object, arguments );
    }
}


/**
 *  Format the number as a file size.
 *
 *  @param  {String}    specific    Optional. Specify which unit among [ 'bytes', 'kB', 'MB', 'GB', 'TB' ].
 *  @return {String}    The number formatted as a file size.
 */
Number.prototype.formatFileSize = function( specific )
{
    var tmp = this,
        ext = [ 'bytes', 'kB', 'MB', 'GB', 'TB' ];

    for( var i=0,suffix; suffix=ext[i]; i++ )
    {
        if( tmp<1024 || i==ext.length-1 || ext[i]==specific )
        {
            return Math.round(tmp*100)/100 +' '+suffix;
        }
        tmp /= 1024;
    }
    return 'N/A';
}


/**
 *  Replace the special characters in the string by their HTML entities equivalent.
 *
 *  @return {String} The string with HTML entities.
 */
String.prototype.HTMLEntities = function()
{
    return this.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}


/**
 *  Return a copy of an object.
 *
 *  @param  {Object}    original    The object to copy.
 *  @return {Object}    A copy of the original object.
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
 *  Return the SHA1 hash of the string passed in argument.
 *
 *  @param  {String}    msg     The string to hash.
 *  @return {String}    The SHA1 hash of the msg.
 */
function _hash( msg )
{
    // constants [4.2.1]
    var K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

    // PREPROCESSING
    msg += String.fromCharCode(0x80);  // add trailing '1' bit to string [5.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [5.2.1]
    var l = Math.ceil( msg.length/4 )+2,  // long enough to contain msg plus 2-word length
        N = Math.ceil(l/16),              // in N 16-int blocks
        M = new Array(N);

    for( var i=0,k=0; i<N; i++ )
    {
        M[i] = new Array(16);
        for( var j=0; j<16; j++ )
        {
            // encode 4 chars per integer, big-endian encoding
            M[i][j] =   (msg.charCodeAt( k++ )<<24)+
                        (msg.charCodeAt( k++ )<<16)+
                        (msg.charCodeAt( k++ )<< 8)+
                         msg.charCodeAt( k++ );
        }
        // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [5.1.1]
    // note: most significant word would be ((len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators

    M[N-1][14] = Math.floor( ((msg.length-1)*8) / Math.pow(2, 32) );
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

    // set initial hash value [5.3.1]
    var H = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ]

    // HASH COMPUTATION [6.1.2]
    var W = new Array(80);
    var a, b, c, d, e;
    for( var i=0; i<N; i++ )
    {
        // 1 - prepare message schedule 'W'
        for( var t=0; t<16; t++ )
            W[t] = M[i][t];

        for( var t=16; t<80; t++ )
            W[t] = hash_sha1_ROL( W[t-3]^W[t-8]^W[t-14]^W[t-16], 1 );

        // 2 - initialise five working variables a, b, c, d, e with previous hash value
        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];

        // 3 - main loop
        for( var t=0; t<80; t++ )
        {
            var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
            var T = (hash_sha1_ROL( a, 5 )+ hash_sha_f411( s, b, c, d )+ e+ K[s] + W[t]) & 0xffffffff;
            e = d;
            d = c;
            c = hash_sha1_ROL( b, 30 );
            b = a;
            a = T;
        }

        // 4 - compute the new intermediate hash value
        H[0] = (H[0]+a)&0xffffffff;
        H[1] = (H[1]+b)&0xffffffff;
        H[2] = (H[2]+c)&0xffffffff;
        H[3] = (H[3]+d)&0xffffffff;
        H[4] = (H[4]+e)&0xffffffff;
    }

    return  ('0000000'+H[0].toString(16)).slice(-8)+
            ('0000000'+H[1].toString(16)).slice(-8)+
            ('0000000'+H[2].toString(16)).slice(-8)+
            ('0000000'+H[3].toString(16)).slice(-8)+
            ('0000000'+H[4].toString(16)).slice(-8)

    function hash_sha1_ROL( x, n )
    {
        return (x<<n) | (x>>>(32-n));
    }
    function hash_sha_f411( s, x, y, z )
    {
        switch( s )
        {
            case 0: return (x&y)^(~x&z);
            case 2: return (x&y)^(x&z)^(y&z);
        }
        return x^y^z;
    }
}

/**
 *  getUID
 */
function _getUID( len )
{
    var len = len||8;
    return (new Array(len).join("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_")).split('').sort(function(){return Math.random()-.5}).slice(0,len).join('');
}

/**
 *  Timer
 *
 *  @ignore
 */
var Timer = function(newTitle)
{
    var title   = newTitle||'Untitled';
    var data    = {};
    var depth   = 1;

    /**
     *  @ignore
     */
    this.reset = function()
    {
        data={};
    }
    /**
     *  @ignore
     */
    this.toggle =
    /**
     *  @ignore
     */
    this.t  = function(id)
    {
        var n=new Date().getTime(),
            d=data[id]||{t:0,n:0}
        if( ++d.n&1 )
        {
            d.t-=n;
            d.d=depth++;
        }
        else
        {
            d.t+=n;
            depth--;
        }
        data[id]=d
    }
    /**
     *  @ignore
     */
    this.output = function()
    {
        PSO.pub( title, this.dump() );
    }
    /**
     *  @ignore
     */
    this.dump   = function()
    {
        var d='';
        for(var k in data)
        {
            if(data[k].constructor!==Function)
            {
                if( data[k].n&1 )
                {
                    this.t(k);
                }
                d+='\n> '+new Array(data[k].d).join('- ') +data[k].t+'ms for '+(data[k].n/2)+' '+k;
            }
        }
        return d;
    }
}


/**
 *  Enumerate an object.
 *
 *  @param  {Object}    object  The object to enumerate.
 *  @param  {String}    label   Optional. The label of the enumeration.
 *  @param  {Number}    depth   Optional. The maximum depth of recursion. Default to 5.
 *  @return {String}    A formatted enumeration of the object.
 */
function _enumerateObject(w,n,d,c)
{
    var t = typeof(w);
    var o = (n||'')+' ('+t+') = ';
    if( t==='object' )
    {
        var g = '   ';
        var d = arguments.length==3?arguments[2]:5;
        var c = arguments.length==4?arguments[3]:0;
        if( d>0 )
        {
            var i = '\n'+new Array(c+1).join(g)
            var p = [];
            for( var k in w )
            {
                p.push( arguments.callee(w[k],k,d-1,c+1) );
            }
            o += i+'{'+i+g+p.join(i+g)+i+'}';
        }
        else
        {
            o += '*** REACHED MAX DEPTH ***';
        }
    }
    else
    {
        o += (''+w).split('\n')[0].replace(/\r/g,'');
    }
    return o;
}