/**
 * Copyright (c) 2009, Opera Software ASA
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Opera Software ASA nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA AND CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA AND CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

 /**
  * @fileoverview
  * Template library.
  *
  * @author António Afonso, Opera Software ASA (antonio.afonso@opera.com)
  * @version 0.5
  */

/**
 * @namespace Markuper
 */
var markuper = {};

/**
 * This class has no public constructor.
 * @class Container for helper functions to serialize and deserialize HTML into DOM objects.
 */
markuper.HTMLHelper =
{
    // HINT: change it to use Resig's html parser (adapt it to use DocumentFragment?)
    //       http://smallr.net/htmlparser
    /**
     * Constructs an DOM document given an html string
     *
     * @param   {String}    html    The HTML string.
     * @returns {DOM} The DOM document constructed from the html string given.
     */
    parseFromString: function( html )
    {
        var doc = document.implementation.createHTMLDocument('');
        
        // HACK: do this so it's possible to load plain text
        if ( html[0] != '<' ) { html = '<body>' + html + '</body>' };
        
        doc.documentElement.outerHTML = html;
        return doc;
    },
    /**
     * Constructs an HTML string representing the given DOM document.
     *
     * @param   {DOM}   doc The DOM document to be serialized.
     * @returns {String}    The HTML string representing the DOM document.
     */
    serializeToString: function( doc )
    {
        return '<!doctype html>\n' +
               doc.documentElement.outerHTML;
    }
}

/**
 * This class has no public constructor.
 * @class Mixin to add more functionality to elements returned by {@link markuper.Template#select}, makes elements template aware.
 */
markuper.extendedElement =
/**
 * @lends #extendedElement#
 */
{
    /**
     * Removes element from the DOM
     */
    remove: function()
    {
        this.parentNode && this.parentNode.removeChild( this );

        return this;
    },
    /**
     * Removes element from the DOM conditionally
     */
    removeIf: function( remove )
    {
        if( !!remove === true )
        {

            return this.remove();
        }

        return false;
    },
    /**
     * Applies the {@link markuper.Template#everyValue} function to this node as root.
     */
    everyValue: function( fn )
    {
        return this._template.everyValue( fn, this );
    },
    /**
     * Applies the {@link markuper.Template#fillValues} function to this node as root.
     */
    fillValues: function( data, parseNodeAttributes )
    {
        return this._template.fillValues( data, this, parseNodeAttributes );
    },
    /**
     * Applies the {@link markuper.Template#everyDataAttribute} function to this node as root.
     */
    everyDataAttribute: function( attribute, fn )
    {
        return this._template.everyDataAttribute( attribute, fn, this );
    },
    /**
     * Applies the {@link markuper.Template#parseDataAttribute} function to this node as root.
     */
    parseDataAttribute: function( attribute, userData, parseNodeAttributes )
    {
        return this._template.parseDataAttribute( attribute, userData, this, parseNodeAttributes );
    },
    /**
     * Applies the {@link markuper.Template#parseDataAttributes} function to this node as root.
     */
    parseDataAttributes: function( userData, parseNodeAttributes )
    {
        return this._template.parseDataAttributes( userData, this, parseNodeAttributes );
    },
    /**
     * Applies the {@link markuper.Template#parseDataAttributes} and {@link markuper.Template#fillValues} function to this node as root.
     */
    parse: function( userData, parseNodeAttributes )
    {
        this.parseDataAttributes( userData, parseNodeAttributes );
        this.fillValues( userData, parseNodeAttributes );
        
        return this;
    },
    /**
     * Applies the {@link markuper.Template#addItemsToList} function to this node as root.
     */
    addItemsToList: function()
    {
        return this._template.addItemsToList.call( this._template, arguments );
    },
    /**
     * Applies the {@link markuper.Template#select} function to this node as root.
     */
    select: function( selector )
    {
        return this._template.select( selector, this );
    },
    /**
     * Applies the {@link markuper.Template#xpath} function to this node as root.
     */
    xpath: function( xpath )
    {
        return this._template.xpath( xpath, this );
    },
    /**
     * Replaces this node on the DOM by all its children
     */
    unwrap: function()
    {
        var child;

        while( child = this.firstChild )
        {
            this.parentNode.insertBefore( child, this );
        }
        this.parentNode.removeChild( this );
    },
    /**
     * Imports the template given by <code>path</code> and inserts it as child members of this node.
     */
    importTemplate: function( path, selector )
    {
        selector = selector || 'body';
        var tmpl = new markuper.Template( path );
        var nodes = tmpl.select( selector );
        var html = '';

        if( !nodes ) { return; }

        // FIXME: need to change the select function
        if ( nodes.length )
        {
            for( var i = 0, node; node = nodes[i]; i++ )
            {
                html += node.innerHTML;
            }
        }
        else
        {
            html = nodes.innerHTML;
        }

        this.innerHTML = html;
    },
    _template: null
}

/**
 * Adds a set of properties from an object to a another specific object.
 *
 * <p>If the <code>element</code> <code>looksLikeArray</code> then instead of just having the <code>features</code> appended to it, whenever one of the features is called it will be also called, with the same arguments, in every element of the array.</p>
 *
 * @param   {Object}    element     The object receiving the aditional properties.
 * @param   {Object}    features    The object with the aditional properties.
 * @returns {Object}                The element with the extended features.
 */
markuper.addFeaturesToElement = function ( element, features )
{
    var likeArray = markuper.looksLikeArray( element );

    for ( var feature in features )
    {
        if( likeArray )
        {
            (function(fn)
            {
                element[feature] = function()
                {
                    for( var i = 0; i < this.length; i++ )
                    {
                        fn.apply( this[i], arguments )
                    }
                    
                    return this;
                }
            })( features[feature] );
        }
        else
        {
            element[feature] = features[feature];
        }
    }

    return element;
}

/**
 * Decides if an object can be manipulated like an array.
 *
 * This function uses some heuristics (duck typing mostly) to decide if the object has a <code>length</code> property and if it can be accessed with <code>[ix]</code> notation.
 *
 * @param   {Object}    obj Object to be analysed.
 * @returns {boolean}       If it can be manipulated as an array or not.
 */
markuper.looksLikeArray = function( obj )
{
    return  obj instanceof Object
            && !(obj instanceof Node)
            && typeof( obj ) !== 'string'
            && (typeof( obj[0] ) !== 'undefined' || obj.length == 0)
}

/**
 * Retrieves a specific value from an hierarchy tree of objects where <code>data</code> is the root.
 *
 * <p>The value retrieved is the object located at <code>key</code>. This <code>key</code> is a String in a dot separated format that represents the path from the root element to the value.</p>
 *
 * <b>Example:</b>
 * <pre class="code">var foo = {
 *    key1: 'value1',
 *    key2: {
 *        key3: 'value3'
 *    }
 *};
 *var v1 = getData( foo, 'key1' );
 *var v2 = getData( foo, 'key2.key3' );</pre>
 * In this example <code>v1</code> will get the value <code>'value1'</code> and <code>v2</code> the value <code>'value3'</code>.
 *
 * @param   {Object}    data    The root object.
 * @param   {String}    key     The path to the value.
 * @returns {Object|native}     The value found at the path.
 */
markuper.getData = function( data, key )
{
    if( key == null || data == undefined ) { return null };

    var keys = key.split('.');

    if( keys[0] in data )
    {
        if( keys.length > 1 && data[keys[0]] instanceof Object )
        {
            return arguments.callee( data[keys[0]], keys.slice(1).join('.') );
        }
        else
        {
            return data[keys[0]];
        }
    }
}

/**
 * Sets a specific value in an hierarchy tree of objects where <code>data</code> is the root.
 *
 * The logic of the parameters is the very same as for {@link #.getData} with the adition of the <code>value</code> parameter which is the value to be setted at <code>key</code>.
 * <p>If the <code>value</code> parameter is <code>null</code> then the object at <code>key</code> will be removed from the hierarchy of objects.<p>
 * <p>Note that the value pointed to by <code>key</code> must exist.</p>
 *
 * @param   {Object}        data    The root object.
 * @param   {String}        key     The path to the value.
 * @param   {Object|native} value   The value to be set.
 */
markuper.setData = function( data, key, value )
{
    var keys = key.split('.');

    if ( keys.length > 1 )
    {
        // slice(0) copies the array, we don't want to change it
        var keysClone = keys.slice(0);
        keysClone.pop();
        data = markuper.getData( data, keysClone.join('.') );
    }

    if ( !(data instanceof Object) ) { return };

    if ( value === null )
    {
        delete data[keys[keys.length-1]];
    }
    else
    {
        data[keys[keys.length-1]] = value;
    }
}

/**
 * Splits a text node into two returning the second half.
 *
 * The received <code>textNode</code> will have its <code>textContent</code> right timmed from <code>ix</code> till the end of the string.
 * <p>A new text node will be created with the contents of the trimmed text of <code>textNode.textContent</code> left trimmed <code>length</code> characters, and added to the document where <code>textNode</code> resides in a way that will make it the <code>textNode.nextSibling</code>.
 * <p>This new text node will be returned by the function.</p>
 *
 * <b>Example:</b>
 * <pre class="code">var textNode = document.createTextNode( 'This is a long text node' );
 *var newNode = splitTextNode( textNode, 5, 3 );</pre>
 * After the function call we will have:
 * <table border="1">
 *   <tr>
 *     <th>Expression</th>
 *     <th>Value</th>
 *   </tr>
 *   <tr>
 *     <td><code>textNode.textContent</code></td>
 *     <td><code>'This '</code></td>
 *   </tr>
 *   <tr>
 *     <td><code>newNode.textContent</code></td>
 *     <td><code>'a long text node'</code></td>
 *   </tr>
 *   <tr>
 *     <td><code>textNode.nextSibling == newNode</code></td>
 *     <td><code>true</code></td>
 *   </tr>
 * </table>
 *
 * @param   {TextNode}  textNode    The text node to be split into two.
 * @param   {int}       ix          The index used for right trimming the text in the <code>textNode</code>
 * @param   {int}       length      The index used for left trimming the remaing text of textNode's right trim.
 * @returns {TextNode}              The new text node created.
 */
markuper.splitTextNode = function( textNode, ix, length )
{
    length = length || 0;
    var document        = textNode.ownerDocument;
    var newTextContent  = textNode.textContent.slice( ix + length );
    var node            = document.createTextNode( newTextContent );
    var nextNode        = textNode.nextSibling;

    textNode.textContent = textNode.textContent.slice( 0, ix );

    if( textNode.parentNode )
    {
        if( nextNode )
        {
            textNode.parentNode.insertBefore( node, nextNode );
        }
        else
        {
            textNode.parentNode.appendChild( node );
        }
    }

    return node;
}

/**
 * An enhanced version of <code>Array.prototype.split</code>.
 *
 * <p>Besides the splitted values the resulting array will also have the delimiters
 * between the values that were splitter.</p>
 * <p>This can be useful when you want to split using a RegExp but also know at the same time what text was considered a delimiter.</p>
 *
 * <b>Example:</b>
 * <pre class="code">
 *> splitWithDelimiters( 'xxxxaayyyybbzzzz', /aa|bb/ );
 *['xxxx', 'aa, 'yyyy', 'bb', 'zzzz'];</pre>
 */
markuper.splitWithDelimiters = function( str, regexp )
{
    var result = [];
    var lastIndex = 0;
    str.replace( regexp, function(match, offset)
    {
        result.push( str.slice( lastIndex, offset ) );
        result.push( match );
        lastIndex = offset + match.length;
    });
    if( lastIndex < str.length ) result.push( str.substr( lastIndex ) );
    
    return result;
}

/**
 * @namespace Functions used for the evaluation of boolean expressions
 */
markuper.evaluator = {};

// mind the order
/**
 * Operators supported by the expression evaluator.
 *
 * <pre>{
 *  operator,   // the text symbol used for the operator. if you want spaces 
 *              // just provide the symbol with spaces.
 *  numberOp,   // number of operands.
 *  typeOp,     // if it's a 1 operand operator this field indicates if it's a 'prefix'
 *              // or 'suffix' operator.
 *  operation,  // the function with the logic for the operator, it receives as 
 *              // many boolean values as expected number of operands.
 * }</pre>
 */
markuper.evaluator.operators =
[{
    operator    : '!',
    numberOp    : 1,
    typeOp      : 'prefix',
    operation   : function(op) { return !op; }
},
{
    operator    : '!=',
    numberOp    : 2,
    operation   : function(left, right) { return left != right; }
},
{
    operator    : '==',
    numberOp    : 2,
    operation   : function(left, right) { return left == right; }
},
{
    operator    : '&&',
    numberOp    : 2,
    operation   : function(left, right) { return !!left && !!right; }
},
{
    operator    : '||',
    numberOp    : 2,
    operation   : function(left, right) { return !!left || !!right; }
}];

/**
 * Field with the regexp used to split a simple boolean expression into an array
 */
markuper.evaluator.operatorsRegExp = (function()
{
    var regexpArr = [];
    for( var i=0,op; op=markuper.evaluator.operators[i]; i++ )
    {
        regexpArr.push( op.operator.replace( /[|]/g, '\\$&' ) );
    }
    // when there are operators that are prefix of another we want the bigger
    // ones first, like ['!=', '!'] and not ['!', '!=']
    regexpArr.sort().reverse();
    
    return new RegExp( regexpArr.join( '|' ), 'g' );
})();

/** 
 * A wrapper for {@link markuper.getData} with support for 'true' and 'false', strings, numbers and literal arrays.
 * 
 * @param   {Object}    data    The data object.
 * @param   {String}    key     The index for the <code>data</code> object.
 * @returns {Object|native}     The value found in the <code>data</code> object by indexing it through <code>key</code>.
 */
markuper.getValue = function( data, key )
{
    if( key === undefined || key === null ) { return; }
    
    var bools = {'true': true, 'false': false};
    // is it a boolean value?
    if( key.toLowerCase() in bools ) { return bools[key.toLowerCase()]; };
    // is it a string?
    if( key.trim().match(/^%27(.*)%27$/) )
    {
        return markuper.unescapeString(RegExp.$1)
                       .replace( /\\(.)/g,  '$1' );
    };
    // is it a number?
    var number = Number( key );
    if( key.trim() != "" && !isNaN(number) ) { return number; }
    // is it an array?
    if( key.trim().match(/^\[.*\]$/) )
    {
        return markuper.evaluator.evalArrayExpression( key, data );
    }
    
    // TODO: make this the first item
    return markuper.getData( data, key );
}

/**
 * This helper function escapes all the strings - sequences of characters delimited by single quotes - found including their single quotes delimiters using the <code>escape</code> function.
 *
 * @see unescapeString
 */
markuper.escapeStrings = function( expr )
{
    return expr && expr.replace( /'(\\.|[^'])*'/g, function( str )
    {
        return escape(str);
    });
}

/**
 * This helper function unescapes a string previously escaped by {@link escapeStrings}.
 *
 * @see escapeStrings
 */
markuper.unescapeString = function( string )
{
    return unescape(string);
    //return string.replace( /%27.*%27/, function(str){return(unescape(str))} );
}

/**
 * @field Dictionary of registered filters
 */
markuper.evaluator.filters = {};

/**
 * Registers a filter to be used in <code>{{}}</code> constructions.
 *
 * Filters are one-parameter functions that can transform their input by returning any desired value and are meant to be used inside <code>{{}}</code> constructions as a way to perform text transformations.
 * <p>Filters are used by prefixing them with a pipe '|' character.</p>
 * <pre><code>{{data.key|filter}}</code></pre>
 * The result of the evaluation of the expression that stands at the left of the pipe will be the input of the filter. The value of the expression after the filter is executed will then be the output of the filter.
 * It is also possible to concatenate several filters in a row
 * <pre><code>{{data.key|filter1|filter2|filtern}}</code></pre>
 * where the input of filter n+1 will be the output of filter n.
 *
 * Registered filters will automatically be handled by the function {@link #fillValues} while parsing text.
 *
 * <p>The callback function <code>fn</code> will be called with the following arguments:
 * <ul>
 *   <li><code>input</code>: the data to be transformed.</li>
 * </ul></p>
 *
 * @param {String}      attribute   The filter name, this will be the name recognized inside <code>{{}}</code> constructions.
 * @param {Function}    fn          The callback function to be called when processing the filter.
 *
 * @see #fillValues
 */
markuper.evaluator.registerFilter = function( name, fn )
{
    markuper.evaluator.filters[name] = fn;
};

/**
 * Registers all built-in filters.
 *
 * @inner
 */
(function setupFilters()
{
    markuper.evaluator.registerFilter( 'escape', function( input )
    {
        if( typeof(input) != 'string' ) { return input; };
        
        return input.replace(/'/g, "&#39;").replace(/"/g, "&quot;")
                    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/&/g, "&amp;");
    });
    
    markuper.evaluator.registerFilter( 'escapejs', function( input )
    {
        if( typeof(input) != 'string' ) { return input; };
        
        return input.replace(/'/g, "&#39;").replace(/"/g, "&quot;")
                    .replace(/\./g, '\\$&').replace(/\n/g, "\\n");
    });

    markuper.evaluator.registerFilter('urlencode', function(input) {
        if( typeof(input) != 'string' ) { return input; };

        return escape(input);
    });
    
    markuper.evaluator.registerFilter('node', function(input) {
        if( typeof(input) != 'string' ) { return input; };
        
        var div = document.createElement('div');
        div.innerHTML = input;
        return div.childNodes;
    });
})();

// FIXME: needs refactoring with a sane BNF definition.
markuper.evaluator.evalExpression = function( expr, data )
{
    if( expr === null || expr === undefined ) { return expr; }
    
    var value;
    var registeredFilters = markuper.evaluator.filters;
    expr = markuper.escapeStrings( expr );
    
    // support for filters: [|func]*
    var filters = expr.split('|');
    // remove the first element which is the expression, only filters
    // will remain
    expr = filters.shift();
    
    // support for the ternary operator
    if( typeof expr == 'string' 
     && expr.match( /(.+)\s+\?\s+([^\s]+)(?:\s+:\s+([^\s]+))?/ ) )
    {
        var ifTrue = RegExp.$2;
        var ifFalse = RegExp.$3;
        var boolExpr = markuper.evaluator.evalBooleanExpression( RegExp.$1, data );
        
        value = boolExpr ? arguments.callee(ifTrue, data) : arguments.callee(ifFalse, data);
    }
    else
    {
        //return markuper.getData( data, expr );
        value = markuper.getValue( data, expr );
    }
    
    // apply filters
    for( var i = 0, filter; filter = (filters[i]||'').trim(); i++ )
    {
        if( !(filter in registeredFilters) )
        {
            throw {message: "Filter not found: " + filter};
        }
        value = registeredFilters[filter]( value, expr );
    }
    
    return value;
}

/**
 * Evaluates a simple boolean expression.
 * <p>A simple boolean expression is just like a boolean expression defined in {@link #.evalBooleanExpression} minus the grouping elements, or in other words, without parenthensis</p>.
 * <b>Operators List</b>
 * <table>
 *   <tr>
 *     <th>Precedence Level</th>
 *     <th>Associates</th>
 *     <th>Operator</th>
 *     <th>Operation</th>
 *   </tr>
 *   <tr>
 *     <td>1</td>
 *     <td>Left</td>
 *     <td>!</td>
 *     <td>Logical Not</td>
 *   </tr>
 *   <tr>
 *     <td>2</td>
 *     <td>Left</td>
 *     <td>&&</td>
 *     <td>Logical And</td>
 *   </tr>
 *   <tr>
 *     <td>3</td>
 *     <td>Left</td>
 *     <td>||</td>
 *     <td>Logical Or</td>
 *   </tr>
 * </table>
 * <b>Example:</b><br>
 * <code>data.isOwner && data.hasPermission || data.isFile</code>
 *
 * @param   {String}    expr    The simple boolean expression.
 * @param   {Data}      data    The data object to be indexed with the keys found in the <code>expr</code> expression.
 * @returns {Boolean}           The result of the evaluation of the <code>expr</code> expression.
 *
 * @see #.evalBooleanExpression
 */
markuper.evaluator.evalBooleanSimpleExpression = function( expr, data )
{    
    var operators   = markuper.evaluator.operators;
    var parsedExpr  = markuper.splitWithDelimiters( expr, markuper.evaluator.operatorsRegExp );
    
    // remove empty entries
    for( var i=parsedExpr.length-1; i >= 0; i-- )
    {
        if( parsedExpr[i].match( /^\s*$/ ) ) { parsedExpr.splice( i, 1 ); }
    }
    
    var ix;
    for( var i=0,op; op=operators[i]; i++ )
    {
        // search for the /op/ operator from left to right and replace it
        // and its operands by the result of its evaluation
        while( (ix = parsedExpr.indexOf( op.operator )) > -1 )
        {
            switch( op.numberOp )
            {
                case 1:
                var offset  = op.typeOp == 'prefix' ? 1 : -1,
                    operand = markuper.getValue( data, parsedExpr[ix+offset].trim() ),
                    bool    = op.operation( operand ) ? 'true' : 'false';
                // replace the expression by its computed value
                parsedExpr.splice( ix+(op.typeOp=='prefix'?0:-1), 2, bool );
                break;
                
                case 2:
                var left    = markuper.getValue( data, parsedExpr[ix-1].trim() ),
                    right   = markuper.getValue( data, parsedExpr[ix+1].trim() ),
                    bool    = op.operation( left, right ) ? 'true' : 'false';
                // replace the expression by its computed value
                parsedExpr.splice( ix-1, 3, bool );
                break;
            }
        }
    }
    
    return !!markuper.getValue( data, parsedExpr[0] );
}

/**
 * <p>Evaluates a boolean expression consisting of keys to the <code>data</code> structure, <code>true</code>, <code>false</code>, <code>&amp;&amp;</code>, <code>||</code> and grouping using parenthensis.</p>
 * <b>Example:</b><br>
 * <code>data.isOwner && (data.hasPermission || data.isFile)</code>
 * <p>It's also possible to prepend <code>true ||</code> to the expression to make it evaluate to <code>true</code> regardless of the rest of the expression.</p>
 * <b>Example:</b><br>
 * <code>true || data.isOwner && (data.hasPermission || data.isFile)</code>
 *
 * @param   {String}    expr    The expression to evalute.
 * @param   {Object}    data    The data object to be indexed with the keys found in the <code>expr</code> expression.
 * @returns {Boolean}           The result of the evaluation of the <code>expr</code> expression.
 *
 * @see #.evalBooleanSimpleExpression to find out the order of precedence
 */
markuper.evaluator.evalBooleanExpression = function( expr, data )
{
    var expr = markuper.escapeStrings( expr );
    // WARNING: it doesn't short-circuit
    // find the deepest group and substitute it for its value
    // repeat until no more groups are found
    var regexp = /\([^()]+\)/g;

    while( expr.search(regexp) > -1 )
    {
        expr = expr.replace( regexp, function( smallexpr )
        {
            return markuper.evaluator.evalBooleanSimpleExpression( smallexpr.slice(0,-1).slice(1), data );
        });
    }

    return markuper.evaluator.evalBooleanSimpleExpression( expr, data );
}

/**
 * Evaluates a literal array construction given in a string into a javascript array object.
 *
 * @param   {String}    expr    The string with the literal array.
 * @param   {Object}    data    The data object to be indexed with the keys found in the <code>expr</code> expression.
 * @returns {Array}             The array obtained after parsing  <code>expr</code>.
 */
markuper.evaluator.evalArrayExpression = function( expr, data )
{
    var expr = markuper.escapeStrings( expr );
    // find the deepest group and evaluate it and store the value in a stack
    // repeat until no more groups are found
    var regexp = /\[([^\[\]]*)\]/g;
    var stack = [];
    var args;
    
    while( expr.search(regexp) > -1 )
    {
        expr = expr.replace( regexp, function( str, p1 )
        {
            args = p1.trim() == "" ? [] : p1.split(",");
            for( var i = 0; i < args.length; i++ )
            {
                if( args[i].trim() == "" )
                {
                    args[i] = stack.shift();
                }
                else
                {
                    args[i] = markuper.evaluator.evalExpression( args[i], data );
                }
            }
            stack.push( args );
            return "";
        });
    }

    return args;
}

/**
 * Helper function that searches up the hierarchy of <code>node</code> and tries to find any node parent that has one of the attributes specified in <code>attrs</code>.
 *
 * @param   {Node}  node                        The node that will have its parents searched.
 * @param   {Array} attrs                       Attributes to be found on the <code>node</code>'s parents.
 * @param   {Node}  [root=node.ownerDocument]   If specified the hierarchical search will stop at that node
 * @returns {Boolean}       The result of the search.
 */
markuper.hasParentWithDataAttribute = function( node, attrs, root )
{
    root = root || node.ownerDocument;

    while( (node=node.parentNode) && node != root )
    {
        for( var j = 0, attr; attr = attrs[j]; j++ )
        {
            if( node.attributes.getNamedItem('data-'+attr) )
            {
                return true;
            }
        }
    }

    return false;
}

/**
 * @class Generates HTML from a template file.
 *
 * <p>This class represents a template engine, it will load an html file and transform it according to specific rules and a set of values.</p>
 * The template engine is a DOM based one meaning that all libraries depending on the <a href="http://www.w3.org/DOM/">DOM API</a>, such as jQuery or YUI, and all your DOM based code can be used to manipulate the template as if it were a common web page.
 * <p>The rules supported by the engine are only concerned with value substitution/binding, be it a <emph>simple variable</emph>, an array or an object. All logic is meant to be coded in JavaScript files, thus enforcing separation of logic from presentation.</p>
 *
 * <p>The template engine supports several different kinds of variable substitution/binding:</p>
 * <ul>
 *   <li><emph>Simple variables</emph> - either a native type or a String, they can be referenced by using double curly brackets (<code>{{key}}</code>) syntax. The <code>key</code> part will be used to index the object passed in the constructor to access the value and replace the <code>{{key}}</code> text with it.</li>
 *   <li>Arrays - arrays can be bound to nodes via a <code>data-list</code> attribute. A new, cloned, node will be created for each array element, and each node will have access to the respective array element.</li>
 *   <li>Objects - like arrays, objects can also be bounded to nodes via <code>data-list</code>. A new, cloned, node will be created for each object proerty, and each node will have access to the respective object property.</li>
 *   <li>Booleans - boolean values can be binded to a node with <code>data-remove-if</code> and <code>data-keep-if</code> in order to specify if the node has to be deleted or not.</li>
 * </ul>
 * <p>Simple variables can also be filtered through functions using the pipe operator '|'.</p>
 * <b>Example:</b><br>
 * <pre class="code">
 * &ltp&gt;{{key|capitalize}}&lt/p&gt;
 * </pre>
 * These helper functions are called filters. It's possible to create filters with the {@link #registerFilter} function.
 * <pre class="code">
 * tmpl.registerFilter( 'capitalize', function(input)
 *{
 *return input[0].toUpperCase() + input.slice(1);
 *})</pre>
 * <p>While iterating over arrays or objects, using one of the two methods mentioned above, the contents of each element/property will be available under the key <code><nobr>"&lt;data-list&gt;[]"</nobr></code>. In the case of an object property the element available will be in the <code>{key, value}</code> form.</p>
 * <p>These values are passed along in the constructor in the form of a data object, e.g. <code>{key1: 'value1', key2: 'value2'}</code></p>
 *
 * <b>Example 1:</b><br>
 * <code>index.html</code>
 * <pre class="code">
 * &lt;div class="warning" data-remove-if="hasCookies"&gt;
 *    Cookies are required, after enabled them, please refresh this page.
 * &lt;/div&gt;
 * &lt;h1&gt;Temperatures for {{day}} of {{month}}&lt;/h1&gt;
 *&lt;ul&gt;
 *  &lt;li data-list="cities"&gt;
 *    {{cities[].city}}: {{cities[].temperature}} degrees
 *  &lt;/li&gt;
 *&lt;/ul&gt;
 *This week:
 *&lt;ul&gt;
 *  &lt;li data-list="week"&gt;
 *    {{week[].key}}: {{week[].value}}
 *  &lt;/li&gt;
 *&lt;/ul&gt;</pre>
 * Code:
 * <pre class="code">var tmpl = new Markuper( 'index.html',
 *{
 *    day           : 24,
 *    month         : 'February',
 *    hasCookies    : true,
 *    cities        : [
 *        {city: 'Lisbon', temperature: 20},
 *        {city: 'Oslo'  , temperature: -2}
 *    ],
 *    week          : {
 *        'Monday'      : 'Sun',
 *        'Tuesday'     : 'Rain',
 *        'Wednesday'   : 'Snow'
 *    }
 *});
 *tmpl.parse();
 *alert( tmpl.html() );</pre>
 * The alert box will contain:
 * <pre class="code">&lt;h1&gt;Temperatures for 24 of February&lt;/h1&gt;
 *&lt;ul&gt;
 *  &lt;li&gt;
 *    Lisbon: 20 degrees
 *  &lt;/li&gt;
 *  &lt;li&gt;
 *    Oslo: -2 degrees
 *  &lt;/li&gt;
 *&lt;/ul&gt;
 *This week:
 *&lt;ul&gt;
 *  &lt;li&gt;Monday: Sun&lt;/li&gt;
 *  &lt;li&gt;Tuesday: Rain&lt;/li&gt;
 *  &lt;li&gt;Wednesday: Snow&lt;/li&gt;
 *&lt;/ul&gt;</pre>
 *
 * <b>Example 2:</b><br>
 * We can easily add jQuery support using the following function
 * <pre class="code">this.$j = function()
 *{
 *    return jQuery( arguments[0], _template );
 *}</pre>
 * The previous function allow us to manipulate the template document as if it were a common web page using all power of jQuery.
 * <pre class="code">var tmpl = new Markuper( 'index.html' );
 * /&lowast; snip &lowast;/
 *tmpl.$j( "input[@type='checkbox']" ).check( 'on' );
 *tmpl.$j( "li" ).not( ":has(ul)" ).css( "border", "1px solid black" );
 *</pre>
 *
 * <p>It's also possible to define our own <code>data-</code> attribute handling code to extend the <code>Markuper</code> library.<br />
 * This is done by calling {@link #registerDataAttribute} and passing both attribute name and callback function that will be invoked when handling the nodes found.<br />
 * This call will register the attribute and function to be used when calling {@link #parseDataAttributes} and {@link #parseDataAttribute}, both are called by the main {@link #parse} function.</p>
 * <p>When the nodes are being processed the callback associated with them will be called. After returning, the contents of the node will also be <code>parse</code>d unless the callback returns <code>false</code>.
 * <b>Example 3:</b><br>
 * <code>index.html</code>
 * <pre class="code">&lt;div data-html-to-text="preview"&gt;
 *  &lt;ul&gt;
 *    &lt;li&gt;Item 1&lt;/li&gt;
 *    &lt;li&gt;Item 2&lt;/li&gt;
 *    &lt;li&gt;Item 3&lt;/li&gt;
 *    &lt;li&gt;Item 4&lt;/li&gt;
 *  &lt;/ul&gt;
 *&lt;/div&gt;</pre>
 * Code:
 * <pre class="code">var tmpl = new Markuper( 'index.html',
 *{
 *    preview: true
 *});
 *tmpl.registerDataAttribute( 'html-to-text', function( node, data, key, value )
 *{
 *    node.removeAttribute( 'html-to-text' );
 *    if( value )
 *    {
 *        node.textContent = node.innerHTML;
 *    }
 *});</pre>
 * The above code will transform the html of a node into text if <code>data-html-to-text</code> has a <code>true</code> value.
 * <pre class="code">&lt;div&gt;
 *  &amp;lt;ul&amp;gt;
 *    &amp;lt;li&amp;gt;Item 1&amp;lt;/li&amp;gt;
 *    &amp;lt;li&amp;gt;Item 2&amp;lt;/li&amp;gt;
 *    &amp;lt;li&amp;gt;Item 3&amp;lt;/li&amp;gt;
 *    &amp;lt;li&amp;gt;Item 4&amp;lt;/li&amp;gt;
 *  &amp;lt;/ul&amp;gt;
 *&lt;/div&gt;</pre>
 *
 * @param {String}  path                        The path to the template file, should be relative to <code>/application/</code>.
 * @param {Object}  _data                       The object that will be exposed to the template inside the <code>{{key}}</code> elements.
 * @param {Object}  [options]                   The object that contains certain specific options that can modify the behaviour of the contructor.
 * @param {String}  [options.type]              The type of document 'text'|'xml'
 */
markuper.Template = function( path, _data, options )
{
    var _template;
    var _lists      = [];
    var _source     = null;
    var self        = this;
    var _dataAttributes = {};
    var _dataAttributesName = [];
    // array of {name|regexp, fn}
    var _registeredDataAttributes = [];
    var _options    =
    {

    };
    var _debugSpeed = false;
    _data = _data || {};

    /**
     * Apply options' defaults, load template and import templates if specified.
     *
     * @param {String} path The path to the template file, should be relative to <code>/application/</code>.
     *
     * @inner
     */
    function init( path )
    {
        applyDefaults( options );
        
        if( path )
        {
            _source = open( path );
        }
        else
        {
            _source = _options.html || _options.source || '';
            self.reset();
        }
        
        //if(success === null) return;
        _template = createDocument( _source, _options.type );
        setupDataAttributes();
    }

    /**
     * Overwrites <code>_options</code> properties with <code>options</code>.
     *
     * @param {Object} options  The object to merge with <code>_options</code>.
     *
     * @inner
     */
    function applyDefaults( options )
    {
        for( var key in options )
        {
            _options[key] = options[key];
        }
    }
    
    /**
     * Opens <code>path</code> for reading and returns its contents.
     *
     * @param   {String}    path    The path to the template file, should be relative to <code>/application/</code>.
     * @returns {String}               The contents read.
     *
     * @inner
     */
    function open( path )
    {
        if( opera.io.filesystem === undefined )
        {
            throw "Exception: File I/O (opera.io) not available";
        }
        
        var mp = opera.io.filesystem.mountSystemDirectory( 'application' );
        var stream = mp.open( path, 'r' );
        var source = stream.read( stream.bytesAvailable ).trim();
        
        stream.close();
        
        return source;
    }
    
    function createDocument( string, type )
    {
        var doc;
        
        // try to guess...
        if( !type )
        {
            if( /^<\?xml/.test(string) ) { type = 'xml'; }
        }
        
        switch( type )
        {
            case 'text':
                doc = markuper.HTMLHelper.parseFromString( '<pre id="text"></pre>' );
                doc.getElementById('text').textContent = string;
                break;
                
            case 'xml':
                doc = new DOMParser().parseFromString(string, 'text/xml');
                break;
                
            default:
                doc = markuper.HTMLHelper.parseFromString( string );
                break;
        }
        

        return doc;
    }
    
    /**
     * Registers all built-in <code>data-</code> supported attributes
     *
     * @inner
     */
    function setupDataAttributes()
    {
        self.registerDataAttribute( 'list', function( attr, node, data, key, value )
        {
            return fillList( node, data, key, value );
        });
        self.registerDataAttribute( 'dump', function( attr, node, data, key, value )
        {
            return fillDump( node, data, key, value );
        });
        self.registerDataAttribute( 'remove-if', function( attr, node, data, key )
        {
            var value = markuper.evaluator.evalBooleanExpression( key, data );

            node.removeAttribute( 'data-remove-if' );
            if( value )
            {
                node.remove();
                return false; // don't process the contents of this node
            }
        });
        self.registerDataAttribute( 'keep-if', function( attr, node, data, key )
        {
            var value = markuper.evaluator.evalBooleanExpression( key, data );

            node.removeAttribute( 'data-keep-if' );
            if( !value )
            {
                node.remove();
                return false; // don't process the contents of this node
            }
        });
        self.registerDataAttribute( 'import', function( attr, node, data, filename )
        {
            node.removeAttribute( 'data-import' );
            extendElement( node ).importTemplate( filename );
        });
        self.registerDataAttribute( 'set-attribute', function( attr, node, data, key )
        {
            var args = key.split( ' ' );
            var attributeName = args[0];
            var expr = args.slice(1).join(' ');
            
            node.removeAttribute( 'data-set-attribute' );
            setAttribute( node, attributeName, expr, data );
        });
        
        self.registerDataAttribute( 'set-*-attribute', function( attr, node, data, key )
        {
            node.removeAttribute( 'data-'+attr );
            attr = attr.replace( /^set-/, '' ).replace( /-attribute$/, '' );
            setAttribute( node, attr, key, data );
        });
    }
    
    /**
     * Function logic of the <code>data-set-*-attribute</code> registered data attribute.
     *
     * Evaluates <code>expr</code>, if its value is not <code>undefined</code> the add an attribute to <code>node</code> with name <code>name</code> and the <code>expr</code> evaluation as the value.
     *
     * @param   {Node}      node    The node with the <code>data-set-*-attribute</code>.
     * @param   {String}    name    The attribute name
     * @param   {String}    expr    The expression found as the value of the attribute.
     * @param   {Object}    data    The data object to be indexed with the keys found in the <code>expr</code> expression.
     * @returns {Boolean}           <code>true</code> if the attribute was added, <code>false</code> otherwise.
     *
     * @see #setupDataAttributes
     * @inner
     */
    function setAttribute( node, name, expr, data )
    {
        var value = markuper.evaluator.evalExpression( expr, data );
        
        if( value !== undefined )
        {
            node.setAttribute( name, value );
            return true;
        }
        
        return false;
    }
    
    /**
     * Adds the {@link #extendedElement} mixin into the given element along with a template reference as <code>_template</code>.
     *
     * @param   {Element}   element The element to extend.
     * @returns {Element}           The extended element.
     */
    function extendElement( element )
    {
        markuper.addFeaturesToElement( element, markuper.extendedElement );
        element._template = self;

        return element;
    }
    
    /**
     * Rebuilds all the internal structures dealing with the <code>data-</code> attributes.
     *
     * <p>This function is meant to be used everytime the underlying template source is changed. This is needed because the <code>data-</code> attributes that need to be parsed might change if {@link #registerDataAttribute} was called with a regular expression.</p>
     */
    function rebuildDataAttributes()
    {
        var registeredDataAttributes = _registeredDataAttributes;
        
        _registeredDataAttributes = [];
        _dataAttributesName = [];
        _dataAttributes = {};
        for( var i = 0, attr; attr = registeredDataAttributes[i]; i++ )
        {
            self.registerDataAttribute( attr.name || attr.regexp, fn )
        }
    }

    /**
     * Adds an attribute name and corresponding handling callback function to use when the template is being parsed by {@link #parseDataAttribute} or {@link #parse}.
     *
     * @param {String}      attribute    The data attribute name, the <code>name</code> part of <code>data-&lt;name&gt;</code>.
     * @param {Function}    fn          The callback function to be called when processing nodes with <code>data-&lt;attribute&lt;</code> attributes.
     *
     * @see #registerDataAttribute
     */
    function addDataAttribute( attribute, fn )
    {
        _dataAttributes[attribute] = fn;
        if( _dataAttributesName.indexOf( attribute ) < 0 )
        {
            _dataAttributesName.push( attribute );
        }
    }
    
    /**
     * Registers a function for handling nodes with a specifc <code>data-</code> attribute.
     *
     * Registered attributes will automatically be handled by functions {@link #parseDataAttributes}, {@link #parseDataAttribute} and {@link #parse} while parsing nodes.
     *
     * <p>The callback function <code>fn</code> will be called with the following arguments:
     * <ul>
     *   <li><code>node</code>: the node where the attribute resides.</li>
     *   <li><code>data</code>: the object data currently in use by the template.</li>
     *   <li><code>key</code>: the value of the attribute, a key to the data object.</li>
     *   <li><code>value</code>: the value of pointed by <code>key</code> in <code>data</code>.</li>
     * </ul></p>
     *
     * @param {String}      attribute   The data attribute name, the <code>name</code> part of <code>data-&lt;name&gt;</code>.
     * @param {Function}    fn          The callback function to be called when processing nodes with <code>data-&lt;attribute&lt;</code> attributes.
     *
     * @see #parseDataAttributes
     */
    this.registerDataAttribute = function( attribute, fn )
    {
        // http://dev.w3.org/html5/spec/Overview.html#xml-compatible
        if( /[^*a-zA-Z0-9-]/.test( attribute ) ) { return; }
        
        if( attribute.indexOf( '*' ) < 0 )
        {
            _registeredDataAttributes.push( {name: attribute, fn: fn} );
            addDataAttribute( attribute, fn );
        }
        // treat as a "regexp"
        else
        {
            _registeredDataAttributes.push( {regexp: attribute, fn: fn} );
            
            var value = attribute.replace( /\*/g, '[^=]+?' );
            var regexp = new RegExp( '\\bdata-'+value+'(?==)', 'g' );
            var matches = _source.match( regexp ) || [];
            
            for( var i = 0, attr; attr = matches[i]; i++ )
            {
                addDataAttribute( attr.slice('data-'.length), fn );
            }
        }
    }

    /**
     * Returns an array of all registered attributes' names
     *
     * @returns {Array} The attributes' names
     *
     * @see #registerDataAttribute
     */
    this.getRegisteredDataAttributes = function()
    {
        return _dataAttributesName.slice(0);
    }

    /**
     * Parses all attributes registered by {@link #registerDataAttribute}.
     *
     * <p>This function will call {@link #parseDataAttribute} for every attribute registered by {@link #registerDataAttribute}.</p>
     *
     * @param {Object}  userData    The object with the data to be attached to <code>_data</code> object provided in the constructor.
     * @param {Node}    [root]      The root element to use instead of the root of the template document.
     * @param {Boolean} [parseRootAttributes] Decides if data attributes found in the <code>root</code> element should also be parsed or not.
     *
     * @see #registerDataAttribute
     * @see #parseDataAttribute
     */
    this.parseDataAttributes = function( userData, root, parseRootAttributes )
    {
        /*for( var i=0,attr; attr=_dataAttributesName[i]; i++ )
        {
            this.parseDataAttribute( attr, userData, root );
        }*/
        this.parseDataAttribute( _dataAttributesName, userData, root, parseRootAttributes );
    }

    /**
     * Parses a specific attribute, or an array of attributes, that was previous registered by {@link #registerDataAttribute} using the callback function associated with it.
     *
     * <p>Every attribute will be searched in the template and the corresponding node handled to the callback function with the parameters specificed in {@link #registerDataAttribute}</p>
     * <p>The contents of the attributes found is expected to be a key to index the <code>data</code> passed in the constructor in the form of <code>path.to.key</code>.</p>
     *
     * @param {String|Array}    attribute   The attribute to be parsed, can be an array of attributes also.
     * @param {Object}          userData    The object with the data to be attached to <code>_data</code> object as <code>_data.data</code> provided in the constructor.
     * @param {Node}            [root]      The root element to use instead of the root of the template document.
     * @param {Boolean}         [parseRootAttributes=false]   Decides if data attributes found in the <code>root</code> element should also be parsed or not.
     */
    // HINT: maybe this should remove the data-attribute...
    this.parseDataAttribute = function( attribute, userData, root, parseRootAttributes )
    {
        var oldData = _data.data;

        _data.data = userData || _data.data;
        root = root || _template;

        this.everyDataAttribute( attribute, function( node, attr )
        {
            var key         = node.getAttribute( 'data-'+attr ),
                //value       = markuper.getData( _data, key );
                value       = markuper.evaluator.evalExpression( key, _data );
            //opera.postError( 'PARSE - data-' + attr + ': ' + node.id );
            if( _dataAttributes[attr].call( self, attr, extendElement( node ), _data, key, value ) !== false )
            {
                node.parse( userData );
            }
        }, root, parseRootAttributes );

        _data.data = oldData;
    }

    /**
     * Internal iterator over nodes with a <code>data-*</code> attribute.
     *
     * <p>Nodes under other <code>data-*</code> attributed nodes will not be covered.</p>
     * <p>For each node with a <code>data-&lt;attribute&gt;</code> attribute found in the template the callback function <code>fn</code> will be called with the following arguments:
     * <ul>
     *   <li><code>node</code>: the node where the attribute resides.</li>
     *   <li><code>attribute</code>: the name of the data attribute found.</li>
     * </ul></p>
     *
     * @param {String|Array}    attribute   The name of the data attribute to lookup or an array of names.
     * @param {Function}        fn          The callback function that will be called for each node with a <code>data-&lt;attribute&gt;</code> attribute.
     * @param {Node}            [root]      The root element to use instead of the root of the template document.
     * @param {Boolean}         [parseRootAttributes=false]   Decides if data attributes found in the <code>root</code> element should also be parsed or not.
     */
    this.everyDataAttribute = function( attribute, fn, root, parseRootAttributes )
    {
        root = root || _template.documentElement;
        parseRootAttributes = parseRootAttributes == undefined ? false : parseRootAttributes;
        
        if( !markuper.looksLikeArray(attribute) ) { attribute = [attribute]; };

        //var startTime = new Date().getTime();

        var nodes       = [];
        var attrFilter  = '[local-name(.) = \'data-' + attribute.join('\' or local-name(.) = \'data-') + '\']';
        var nodeFilter  = '[@data-' + attribute.join(' or @data-') + ']';
        // get all specified attributes from the child nodes of root
        var childNodes  = self.xpath( './/*' + nodeFilter + '/@*' + attrFilter, root );

        // discard all nodes under root that have a parent with one of the
        // specified attributes. we only want the outline, i.e., first children
        // or great-children with the attributes.
        for( var i = 0, node; node = childNodes[i]; i++ )
        {
            if( markuper.hasParentWithDataAttribute( node.ownerElement, _dataAttributesName, root ) ) continue;
            nodes.push( node );
        }
        
        // also search for root attributes
        if( parseRootAttributes )
        {
            childNodes  = self.xpath( '.' + nodeFilter + '/@*' + attrFilter, root );
            for( var i = 0, node; node = childNodes[i]; i++ )
            {
                nodes.push( node );
            }
        }
        
        //var endTime = new Date().getTime();

        for( var i=0,nodes; node=nodes[i]; i++ )
        {
            fn( node.ownerElement, node.nodeName.match(/^data-(.+)/)[1] );
        }
    }

    /**
     * Internal iterator over <code>{{key}}</code> elements of the template.
     *
     * For each <code>{{key}}</code> element found the callback function <code>fn</code> will be called with the following arguments:
     * <ul>
     *   <li><code>text</code>: the text found within the {{}} syntax.</li>
     *   <li><code>node</code>: the node containing the <code>{{key}}</code>, can be a TextNode or an Attr.</li>
     * </ul>
     * The <code>{{key}}</code> will be subtituited with the return value of the callback unless it returns <code>null</code> or <code>undefined</code>.
     * The following types of elements can be returned:
     * <ul>
     *   <li><code>native</code></li>
     *   <li><code>String</code></li>
     *   <li><code>Node</code></li>
     *   <li><code>Node[]</code></li>
     *   <li><code>Object</code>: it will be toString()'ed</li>
     * </ul>
     *
     * <p>This function provides the user with the proper means to customize the way <code>{{key}}</code>s will be substituted. {@link #fillValues} will substitute them by fetching data from an object, however we can easily create our own version of <code>fillValues</code> that could potentially fetch data from other sources, for instance the internet. As an example imagine that we want to fetch data from the internet for all <code>key</code>s starting with <code>"http://"</code>. A possible solution, in pseudocode, could be:
     * <pre class="code">markuper.Template.prototype.fillValuesFromInternet = function( userData )
     *{
     *    this.everyValue( function( key, root )
     *    {
     *        if ( key.matches( /^http:\/\// ) )
     *        {
     *            return getDataFromInternet( key );
     *        }
     *        else
     *        {
     *            return getData( userData, key );
     *        }
     *    });
     *}</pre>
     * </p>
     *
     * @param {Function}    fn                  The callback function that will be called for each <code>{{key}}</code> found.
     * @param {Node}        [root]              The root element to use instead of the root of the template document.
     * @param {Boolean}     [parseRootAttributes=false]   Decides if <code>{{key}}</code> elements found in the <code>root</code> element attributes should also be parsed or not.
     */
    this.everyValue = function( fn, root, parseRootAttributes )
    {
        root = root || _template;
        parseRootAttributes = parseRootAttributes == undefined ? false : parseRootAttributes;

        var xpathText           = ".//text()[contains(.,'{{')]",
            xpathAttrs          = ".//*/@*[contains(.,'{{')]",
            xpathTextComments   = ".//comment()[contains(.,'{{')]",
            xpathSelfAttrs      = "./@*[contains(.,'{{')]",
            nodes               = this.xpath( xpathText + '|' + xpathTextComments + '|' + xpathAttrs + (parseRootAttributes ? ('|'+xpathSelfAttrs) : ''), root );

        for( var i = 0, node; node = nodes[i]; i++ )
        {
            // see CORE-18198
            if ( !(node instanceof Text || node instanceof Comment || node instanceof Attr) )
            {
                continue;
            }

            var text    = node.textContent,
                regexp  = /\{\{(.+?)\}\}/g,
                match;

            while( match = regexp.exec( text ) )
            {
                var value = fn( match[1], node );

                if( value === null || value === undefined )
                {
                    continue;
                }

                // duck typing: Node || array of Nodes
                if( value instanceof Node || markuper.looksLikeArray( value ) )
                {
                    if( value instanceof Node )
                    {
                        value = [value];
                    }

                    var ix = node.textContent.indexOf( match[0] );
                    node = markuper.splitTextNode( node, ix, match[0].length );

                    for( var j = 0; j < value.length; j++ )
                    {
                        if( !(value[j] instanceof Node) ) { continue; }
                        node.parentNode.insertBefore( value[j].cloneNode( true ), node );
                    }
                }
                else
                {
                    node.textContent = node.textContent.replace
                    (
                        match[0],
                        value.toString()
                    );
                }
            }
        }
    }

    /**
     * Substitutes every <code>{{key}}</code> element with the contents of the <code>_data</code> object provided in the constructor along with <code>userData</code> attached as <code>_data.data</code>.
     * Each <code>key</code> will be used as a path to find the value in the <code>_data</code> object that will replace the <code>{{key}}</code> text in the template.
     * <p></p>
     * <b>Example:</b><br>
     * Template:
     * <pre class="code">It's currently {{data.temperature}} degrees in {{data.city}}, {{data.country}}.</pre>
     * <code>userData</code>:
     * <pre class="code">{
     *    temperature   : 20,
     *    city          : 'Lisbon',
     *    country       : 'Portugal'
     *}
     * </pre>
     * With this data <code>fillValues</code> will transform the template text into
     * <pre class="code">It's currently 20 degrees in Lisbon, Portugal.</pre>
     *
     * @param {Object}  userData    The object with the data to be attached to <code>_data</code> object provided in the constructor.
     * @param {Node}    [root]      The root element to use instead of the root of the document.
     * @param {Boolean} [parseRootAttributes=false]   Decides if <code>{{key}}</code> elements found in the <code>root</code> element attributes should also be parsed or not.
     *
     * @see #everyValue for the documentation of which values are supported in the <code>userData</code> object.
     */
    this.fillValues = function( userData, root, parseRootAttributes )
    {
        var oldData = _data.data;
        _data.data = userData || _data.data;

        this.everyValue( function( key, root )
        {
            //return markuper.getData( _data, key );
            return markuper.evaluator.evalExpression( key, _data );
        }, root, parseRootAttributes );

        _data.data = oldData;
    }

    // TODO: receive a function and put data-select logic in fillOptionList?
    /**
     * Duplicates a specific node as many times as there are elements in the value specified by the <code>data-list</code> attribute key. This function is useful for creating html lists with the contents of an array where each list item corresponds to an array element.
     * <p>This function is not meant to be called directly but rather through <code>handleDataAttribute( 'list', ... )</code>.</p>
     *
     * <p>If this value is an array, then as many nodes as elements in the array will be created. If it is an object, then as many nodes as object's properties will be created instead.</p>
     * After the creation of each node {@link #fillValues} will be called on the node passing <code>userData</code> as the parameter for the <code>userData</code> argument.
     * <p>One aditional field, in the <code>userData</code> object, will be created for each call to <code>node.fillValues</code> that will give access within the template to the corresponding array/object element. This field will be named <code>&lt;data-list&gt;[]</code>.
     * For example, in a node with <code>data-list="data.cities"</code> there will be a <nobr><code>data.cities[]</code></nobr> named value, accessible within that node, with the corresponding array/object element set as that value.</p>
     * <p>In the case that the <code>data-list</code> attribute points to an  <code>Object</code> this aditional element (<nobr><code>&lt;data-list&gt;[]</code></nobr>) will be an <code>Object</code> with two properties - <code>key</code> and <code>value</code> - that will correspond to each object's property name and value respectively.</p>
     * <p>Since this function uses {@link #addItemsToList} to create new nodes the <code>list</code> given will be added to an internal array so it can be easily removed by calling {@link #removeListTemplates}.</p>
     * <p>It is also possible to specify which element will be selected in a list, when the <code>list</code> argument is an <code>&lt;option&gt;</code>, by means of using a <code>data-select</code> attribute with the value of the item that should be selected.</p>
     *
     * <b>Example with an Array:</b><br>
     * <code>list</code>:
     * <pre class="code">&lt;li data-list="data.cities"&gt;
     *  {{data.cities[].city}}: {{data.cities[].temperature}} degrees
     *&lt;/li&gt;</pre>
     * <code>userData</code>
     * <pre class="code">{cities: [
     *    {city: 'Lisbon', temperature: 20},
     *    {city: 'Oslo'  , temperature: -2}
     *]}</pre>
     * The result of calling <code>fillList</code> with these values will be:
     * <pre class="code">&lt;li id="data.cities-1"&gt;
     *  Lisbon: 20 degrees
     *&lt;/li&gt;
     *&lt;li id="data.cities-2"&gt;
     *  Oslo: -2 degrees
     *&lt;/li&gt;</pre>
     *
     * <b>Example with an Object:</b><br>
     * <code>list</code>:
     * <pre class="code">&lt;li data-list="data.city"&gt;
     *  {{data.cities[].key}}: {{data.cities[].value}}
     *&lt;/li&gt;</pre>
     * <code>userData</code>
     * <pre class="code">{city: {
     *    City:         : 'Lisbon',
     *    Country       : 'Portugal'
     *    Temperature:  : 20
     *}}</pre>
     * The result of calling <code>fillList</code> with these values will be:
     * <pre class="code">&lt;li id="data.city-1"&gt;
     *  City: 20
     *&lt;/li&gt;
     *&lt;li id="data.city-2"&gt;
     *  Country: Portugal
     *&lt;/li&gt;
     *&lt;li id="data.city-3"&gt;
     *  Temperature: 20
     *&lt;/li&gt;</pre>
     *
     * @param   {Node}          list        The node with the <code>data-list</code> attribute to be replicated.
     * @param   {Object}        data        The data object used in the template.
     * @param   {String}        listDataKey The contents of the <code>data-list</code> attribute.
     * @param   {Object|native} listData    The value of <code>listDataKey</code> in <code>data</code>.
     *
     * @see #addItemsToList
     * @see #setupDataAttributes
     * @inner
     * @public
     */
    function fillList( list, data, listDataKey, listData )
    {
        if ( !list || !list.parentNode ) { return null };
        
        var listSelectKey   = list.getAttribute( 'data-select' );
        //var listSelect      = markuper.getData( data, listSelectKey );
        var listSelect      = markuper.evaluator.evalExpression( listSelectKey, data );

        var listValues      = [];

        if( listData instanceof Array )
        {
            listValues = listData;
        }
        else if( listData instanceof Object )
        {
            for( var key in listData )
            {
                listValues.push( {key: key, value: listData[key]} );
            }
        }

        self.addItemsToList( listValues.length, list, function( item, i )
        {
            markuper.setData( data, listDataKey+'[]', listValues[i] );
            if( list.id && list.id.indexOf('{{') < 0) { item.id += '-' + i; };
            
            item.removeAttribute( 'data-list' );
            item.parse( data.data, true );
            
            if( listSelectKey && item.value == listSelect )
            {
                item.setAttribute( 'selected', 'selected' );
            }
        });

        markuper.setData( data, listDataKey+'[]', null );

        // don't parse the contents of this node
        return false;
    }

    /**
     * Duplicates <code>list</code> node by <code>n</code>.
     *
     * Generic function to duplicate an arbitrary node by an arbitrary ammount. It is meant to be used as an helper function for {@link #fllList}.
     * For each duplicate item the callback function <code>fn</code> will be invoked with the following arguments:
     * <ul>
     *   <li><code>item</code>: the new node</li>
     *   <li><code>i</code>: index number of the new node</li>
     * </ul>
     * <p>Consecutive calls to this function with the same arguments are allowed, making the list grow. However, the <code>i</code> argument of the callback function will not reflect the total list items created by previous calls but rather the node index for the specific call.</p>
     *
     * <p>The nodes will always be inserted between the last node inserted and the <code>list</code> node given. The first node will be insert before the <code>list</code> node.</p>
     *
     * <p>The <code>list</code> node given will be stored in an internal array to be used in {@link #removeListTemplates}</p>
     *
     * <b>Example:</b><br>
     * <code>n</code>:
     * <pre class="code">3</pre>
     * <code>list</code>:
     * <pre class="code">&lt;li&gt;
     *  node:
     *&lt;/li&gt;</pre>
     * <code>fn</code>
     * <pre class="code">function( item, i )
     *{
     *    item.textContent += i + '.';
     *}</pre>
     * The result of calling this function with these values will be:
     * <pre class="code">&lt;li&gt;
     *  node: 1.
     *&lt;/li&gt;
     *&lt;li&gt;
     *  node: 2.
     *&lt;/li&gt;
     *&lt;li&gt;
     *  node: 3.
     *&lt;/li&gt;</pre>
     *
     * @see #removeListTemplates
     */
    this.addItemsToList = function( n, list, fn )
    {
        for( var i = 0; i < n; i++ )
        {
            var item = extendElement( list.cloneNode( true ) );
            
            list.parentNode.insertBefore( item, list );
            //list.parentNode.insertBefore( document.createTextNode( '\n' ), list );
            if( fn ) { fn(item, i) };
        }

        _lists.push( list );
    }

    /**
     * Removes all nodes passed as an argument to {@link addItemsToList}.
     *
     * @see #addItemsToList
     */
    this.removeListTemplates = function()
    {
        for( var i = 0, node; node = _lists[i]; i++ )
        {
            node.parentNode && node.parentNode.removeChild( node );
        }

        _lists = [];
    }

    // UGLY: ugly function is ugly
    /**
     * Dumps an arbitrary object using an html pattern.
     *
     * <p>All contents of object <code>obj</code> will be dumped using <code>template</code> node as a pattern.
     * The <code>template</code> node should be a <code>ul</code> item with a <code>li</code> child and a <code>data-dump</code> attribute. This attribute will mandate which object to dump.
     * The <code>li</code> item will be duplicated as many times as properties in the <code>obj</code> object. The corresponding property's name and value will be available, inside the <code>li</code> item, under the keys   <code><nobr>&lt;data-dump&gt;[].key</nobr></code> and <code><nobr>&lt;data-dump&gt;[].value</nobr></code> respectively. If the object in question is an array then the <code>&lt;data-dump&gt;[].key</code> element will be set to the element's index.</p>
     * <p>The dump is recursive meaning that the <code>template</code> will be reused for every <code>obj</code> property that is a generic object. A copy of <code>template</code> will be attached as the child of the <code>li</code> item corresponding to that specific property and the same process repeated.</p>
     * <p>If there are multiple references to the same object, in the object hierarchy, only the first one will be dumped.</p>
     * <p>Object properties that are functions will no be dumped.</p>
     * <p>The <code>data-dump</code> attribute will be removed from the <code>template</code> node.</p>
     *
     * <b>Example:</b>
     * <code>template</code>
     * <pre class="code">&lt;ul data-dump="data.city"&gt;
     *  Object properties:
     *  &lt;li&gt;name: {{data.city[].key}}; value: {{data.city[].value}}&lt;/li&gt;
     *&lt;/ul&gt;</pre>
     * <code>obj</code>
     * <pre class="code">{city: {
     *    city:         : 'Lisbon',
     *    country       : 'Portugal'
     *    temperature   : {celsius: 20},
     *    hotPlaces     : ['Bairro Alto', 'Docas', 'Chiado']
     *}}</pre>
     * Resulting code:
     * <pre class="code">&lt;ul&gt;
     *  Object properties:
     *  &lt;li&gt;name: city; value: Lisbon&lt;/li&gt;
     *  &lt;li&gt;name: country; value: Portugal&lt;/li&gt;
     *  &lt;li&gt;
     *    name: temperature; value: [object Object]
     *    &lt;ul&gt;
     *      Object properties:
     *      &lt;li&gt;name: celsius; value: 20&lt;/li&gt;
     *    &lt;/ul&gt;
     *  &lt;/li&gt;
     *  &lt;li&gt;
     *    name: hotPlaces; value: [Array]
     *    &lt;ul&gt;
     *      Object properties:
     *      &lt;li&gt;name: 0; value: Bairro Alto&lt;/li&gt;
     *      &lt;li&gt;name: 1; value: Docas&lt;/li&gt;
     *      &lt;li&gt;name: 2; value: Chiado&lt;/li&gt;
     *    &lt;/ul&gt;
     *  &lt;/li&gt;
     *&lt;/ul&gt;</pre>
     *
     * @param   {Node}      template        The node to use as a pattern.
     * @param   {Object}    data            The data object used in the template.
     * @param   {String}    objKey          The contents of <code>data-dump</code> attribute.
     * @param   {Object}    obj             The object to dump.
     * @param   {Object}    [references={}] List of references to be ignored  when dumping <code>obj</code>.
     */
    function fillDump( template, data, objKey, obj, references )
    {
        var list = extendElement( template.cloneNode( true ) );
        //var objKey = list.getAttribute( 'data-dump' );
        var prop = list.xpath( './li' )[0];

        list.removeAttribute( 'data-dump' );
        references = references || [];
        //obj = obj || getData( data, objKey );
        references.push( obj );

        template.parentNode.insertBefore( list, template );

        for( var key in obj )
        {
            // disregard functions
            if( obj[key] instanceof Object && obj[key].constructor == Function )
            {
                continue;
            }

            var item = extendElement( prop.cloneNode( true ) );
            var value = obj[key];
            if ( value instanceof Object ) { value = value.toString() };

            markuper.setData( _data, objKey+'[]', {key: key, value: value} );
            item.fillValues();
            prop.parentNode.insertBefore( item, prop );

            if( obj[key] instanceof Object
                && !references.include( obj[key] )
                && !(obj[key] instanceof Array || obj[key] instanceof String) )
            {
                var childTemplate = template.cloneNode( true );
                item.appendChild( childTemplate );
                fillDump( childTemplate, data, objKey, obj[key], references );
            }
        }

        prop.parentNode.removeChild( prop );
        template.parentNode.removeChild( template );

        markuper.setData( _data, objKey+'[]', null );

        return list;
    }

    /**
     * Parses all <code>{{key}}</code>s and nodes with <code>data-*</code> attributes supported by the template engine.
     * <p>This function will also remove all nodes used as templates, namely, nodes with <code>data-list</code> and <code>data-dump</code> attributes.</p>
     *
     * @param {Object}  userData    The object with the data to be attached to <code>_data</code> object as <code>_data.data</code> provided in the constructor.
     */
    this.parse = function( data )
    {
        //if( ... )
        //{
        //    opera.postError( 'template: ' + path );
        //    for( var i=0,attr; attr = _dataAttributesName[i]; i++ )
        //    {
        //        var startTime = new Date().getTime();
        //        this.parseDataAttribute( attr, data );
        //        var endTime = new Date().getTime();
        //        opera.postError( attr + ': ' + (endTime-startTime)/1000 + 's' );
        //    }
        //}
        //else
        //{
            this.parseDataAttributes( data );
        //}
        
        this.fillValues( data );

        this.removeListTemplates();

        return this;
    }

    /**
     * Constructs an HTML representation of the template's current state.
     *
     * @returns {String}    The HTML representation of the template.
     */
    this.html = function()
    {
        return markuper.HTMLHelper.serializeToString( _template );
    }

    /**
     * Constructs an text-only representation of the template's current state.
     *
     * @returns {String}    The text representation of the template.
     */
    this.text = function()
    {
        return _template.body.innerText;
    }

    /**
     * Returns the document in an XML string.
     *
     * @returns {String}    The XML string.
     */
    this.xml = function()
    {
        return new XMLSerializer().serializeToString(_template);
    }
    

    /**
     * Finds elements using a CSS3 selector {@link http://www.w3.org/TR/css3-selectors/}.
     *
     * @param {String}  selector    The CSS3 selector to use.
     * @param {Node}    [root]      The root element to use instead of the root of the template document.
     * @returns {Array|Node}        An array of elements found or a node if only one element was found.
     */
    this.select = function( selector, root )
    {
        if( !selector ) { return extendElement( this.xpath( '//html/body', root )[0].childNodes ); };
        root = root || _template;

        var nodes = root.querySelectorAll( selector );

        if ( nodes.length==0 ) { return null };

        for ( var i = 0, node; node = nodes[i]; i++ )
        {
            extendElement( node );
        }

        return extendElement( nodes );
    }

    /**
     * Find elements using XPath {@link http://www.w3.org/TR/xpath}.
     *
     * @param {String}  xpath           The XPath string.
     * @param {Node}    [contextNode]   The root element to use instead of the root of the template document.
     * @returns {Array}                 An array of elements found.
     */
    this.xpath = function( xpath, contextNode )
    {
        contextNode = contextNode || _template;
        // colapse all adjacent text nodes, xpath will only return the first
        // node of consecutive nodes even if the text found is in the second
        // node.
        contextNode.normalize();
        
        return contextNode.selectNodes( xpath );
    };

    /**
     * Resets the template to its initial state.
     *
     * @param {Object}  [data]  The object that will be exposed to the template inside the <code>{{key}}</code> elements.
     */
    this.reset = function( data )
    {
        _template = createDocument( _source, _options.type );
        _data       = data || _data;
    }

    /**
     * Returns the original, unparsed, string obtained used to instantiate this object.
     *
     * @returns {String}    The unparsed string.
     */
    this.getUnparsedHtml = function()
    {
        return _source;
    }

    // ensure that all this.functions have already been defined
    init( path );

    /*
    // Version of everyDataAttribute only using XPath
    this.everyDataAttributeXPath = function( attribute, fn, root )
    {
        root = root || _template.documentElement;

        var mark        = 'data-tmpl-temp-context';
        var attributes  = '@data-' + _dataAttributesName.join(' or @data-');
        var context     = '(/*|/*//*)[@' + mark + ']';
        / **
         * 1 - we want to process all nodes under a specific node (subtree), we use //*[ancestor::* = //*[@context-node]] for that.
         * 2 - and only those with specific attrs //*[@data-attr][ancestor::* = //*[@context-node]]
         * 3 - but that don't reside under other data-attrs, so ...
         *
         * This xpath query will grab all elements with a specific attribute, in this case data-<code>&lt;attribute&gt;</code>, that don't have any node, with a <code>data-</code> attribute, as a parent node (ancestors).
         * This query is also engineered in a way that also works under a specifc subtree node of the template, meaning that all nodes above the <code>root</code> node will be disregarded as parent nodes of the node we're looking for.
         * <b>The query breakdown:</b>
         * <code>'.//*[@data-' + attribute + ']'</code>
         * This will get us all elements with a <code>data-&lt;attribute&gt;</code> attribute
         *
         * <code>[ancestor::*[@data-attr1 or @data-attr2 or @data-attr3]]</code>
         * This conditional bit will select all ancestors, of the current node, that have at least one attribute out of the list of 'data-' given.
         *
         * Putting the previous expressions together will get us all elements with a <code>data-&lt;attribute&gt;</code> attribute that have at least one ancestor with a 'data-' attribute. When selecting nodes inside conditional parts ([]) the conditional will be true if there is at least one node in the selector.
         * For this particular query we want the opposite, nodes that _dont't_ have ancestors with one of the 'data-' attributes mentioned, hence, a negation is needed:
         * <code>[not(ancestor::*[@data-attr1 or @data-attr2 or @data-attr3])]</code>
         * And with the two expressions together:
         * <code>'.//*[@data-' + attribute + '][not(ancestor::*[@data-attr1 or @data-attr2 or @data-attr3])]'</code>
         *
         * The latter expression will work great if applyed to the entire document, however, if we want to apply this logic only to a subtree of the html document then it will break because the ::ancestor axis will get out of the subtree root element and reach the document root.
         * <pre class="code">&lt;span id="baz" data-attr1="..."&gt;
         *    &lt;span id="foo"&gt;
         *        &lt;span id="bar" data-attr="..."&gt;
         *    &lt;/span&gt;
         *&lt;/span&gt;</pre>
         * Using this html hierarchy as an example, if the root node is id="foo", when applying this xpath expression, as it is, id="bar" would not be found because it has an ancestor (id="baz") with a <code>data-</code> attribute.
         * It is needed to filter the ancestors to only those under the root node. To achieve this let's imagine there's a <code>context()</code> xpath function that points to the root node.
         * To get all nodes under a specific node it will suffice to ask for nodes that have the root node as an ancestor:
         * <code>.//*[ancestor::* = context()]</code>
         *
         * But in this particular case, our nodes are the ancestors of the node with the <code>data-&lt;attribute&gt;</code> attribute, leading to:
         * <code>.//*[@data-' + attribute + '][ancestor::*[ancestor::* = context()]]'</code>
         *
         * Merging this xpath expression with the third one, the one that specifies that the node can't have ancestors with <code>data-</code> attributes, will get the query as:
         * <code>.//*[@data-' + attribute + '][not(ancestor::*[@data-attr1 or @data-attr2 or @data-attr3][ancestor::* = context()])]'</code>
         *
         * There's still on problem remaning, XPath doesn't have support for a function like <code>context()</code> so the idea is to tag the root node in order to easy reference him from the XPath expression. In this case the node is being tagged with a custom made attribute called <code>data-tmpl-temp-context</code>, and the <code>context()</code> is replaced with <code>(./*|./*//*)[@data-tmpl-temp-context]</code>.
         * /
        // different way to think of the query for one attribute
        //var xpath = './/*[@data-' + attribute + '][not(ancestor::* = ' + context + '//*[@' + attributes + '])]';

        // slightly slower, one attribute only, version
        //var xpath = './/*[@data-' + attribute + '][not(ancestor::*[' + attributes + '][ancestor::* = ' + context + '])]';

        if( !looksLikeArray(attribute) ) { attribute = [attribute]; };
        var attrFilter  = 'local-name(.) = \'data-' + attribute.join('\' or local-name(.) = \'data-') + '\'';
        var nodeFilter  = '[@data-' + attribute.join(' or @data-') + ']';
        var xpath = './/*' + nodeFilter + '[not(ancestor::*[' + attributes + '][ancestor::* = ' + context + '])]/@*[' + attrFilter + ']';

        root.setAttribute( mark, 'true' );
        if( _debugSpeed ) { var startTime = new Date().getTime(); };
        var nodes   = this.xpath( xpath, root );
        if( _debugSpeed ) { var endTime = new Date().getTime(); };
        root.removeAttribute( mark );

        //if( ... )
        //{
        //    opera.postError( 'XPATH for: ' + attribute + ' - ' + (endTime-startTime)/1000 + 's - ' + nodes.length + ' nodes found.' );
        //}

        for( var i=0,nodes; node=nodes[i]; i++ )
        {
            fn( node.ownerElement, node.nodeName.match(/^data-(.+)/)[1] );
        }
    }
    */
}

window.Markuper = markuper.Template;

/**
 * @augments String
 * @ignore
 */
String.prototype.trim = function()
{
    return this.replace( /^\s+|\s+$/g, '' );
}
/**
 * @augments Array
 * @ignore
 */
Array.prototype.include = function( obj )
{
    return this.indexOf( obj ) !== -1;
}