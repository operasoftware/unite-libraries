// to generate documentation you need http://code.google.com/p/jsdoc-toolkit/
/**
 * @fileoverview
 * <p>This file contains an API for publishing to an activity stream partly based on http://activitystrea.ms/</p>
 * <p>The activity stream will be an Atom feed with the activity extension in the
 * "http://activitystrea.ms/spec/1.0/" namespace that can be used to programtically analyze the feed/p>
 * TODO: add example and more documentation
 */


if (! window["isArray"])
{
    window["isArray"] = function() { return this != null && typeof this == "object" && 'splice' in this && 'join' in this;}
}

/**
 * @class
 *
 * <p>Enum with possible activity verbs from the <a href="http://martin.atkins.me.uk/specs/activitystreams/activityschema#anchor4">specification</a></p>
 *
 * @name ActivityVerbType
 */
var ActivityVerbType =
{
    /** @member ActivityVerbType */
    Post : 1,
    /** @member ActivityVerbType */
    Share : 2,
    /** @member ActivityVerbType */
    Save : 3,
    /** @member ActivityVerbType */
    Favorite : 4,
    /** @member ActivityVerbType */
    View : 5,
    /** @member ActivityVerbType */
    Follow : 6,
    /** @member ActivityVerbType */
    UnFollow : 7,
    /** @member ActivityVerbType */
    MakeFriend : 8,
    /** @member ActivityVerbType */
    Join : 9,
    /** @member ActivityVerbType */
    Leave : 10,
    /** @member ActivityVerbType */
    Invite : 11
}

/**
 * @static
 * Convert from activity verb enum to name
 * @param {Number} activityVerbType An ActivityVerbType enum
 * @returns The name of the activity verb or null if activity verb is not present
 */
ActivityVerbType.toName = function(activityVerbType)
{
    for (var o in ActivityVerbType)
    {
        if (ActivityVerbType[o] == activityVerbType)
        {
            return o;
        }
    }
    return null;
}

/**
 * @static
 * Convert from activity enum to URI
 * @param {Number} activityVerbType An ActivityVerbType enum
 * @return URI of activity
 */
ActivityVerbType.toUri = function(activityVerbType)
{
    var name = ActivityVerbType.toName(activityVerbType);
    var path = "";
    if (name)
    {
        if (ActivityVerbType.MakeFriend == activityVerbType)
        {
            path = "make-friend";
        }
        else
        {
            path = name.toLowerCase();
        }
    }

    if (name)
    {
        return "http://activitystrea.ms/schema/1.0/" + path;
    }
    else
    {
        return "";
    }
}

/**
 * @class
 * <p>Enum with possible activity objects from the <a href="http://martin.atkins.me.uk/specs/activitystreams/activityschema#anchor5">specification</a> </p>
 *
 * @name ActivityObjectType
 */
var ActivityObjectType =
{
    /** @member ActivityObjectType */
    Article : 1,
    /** @member ActivityObjectType */
    BlogEntry : 2,
    /** @member ActivityObjectType */
    Note : 3,
    /** @member ActivityObjectType */
    File : 4,
    /** @member ActivityObjectType */
    Image : 5,
    /** @member ActivityObjectType */
    Photo : 6,
    /** @member ActivityObjectType */
    PhotoAlbum : 7,
    /** @member ActivityObjectType */
    PlayList : 8,
    /** @member ActivityObjectType */
    Video : 9,
    /** @member ActivityObjectType */
    TvEpisode : 10,
    /** @member ActivityObjectType */
    Movie : 11,
    /** @member ActivityObjectType */
    Audio : 12,
    /** @member ActivityObjectType */
    Bookmark : 13,
    /** @member ActivityObjectType */
    Person : 14,
    /** @member ActivityObjectType */
    Group : 15,
    /** @member ActivityObjectType */
    Place : 16
}

/**
 * @static
 * Convert from activity object enum to name
 * @param {Number} activityObjectType An ActivityObjectType enum
 * @returns The name of the activity type object or null if the activity object is not present
 */
ActivityObjectType.toName = function(activityObjectType)
{
    for (var o in ActivityObjectType)
    {
        if (ActivityObjectType[o] == activityObjectType)
        {
            return o;
        }
    }
    return null;
}

/**
 * @static
 * Convert from activity object enum to URI from the activity specification
 * @param {Number} activityObject An ActivityObject enum
 * @return URI of activity
 */
ActivityObjectType.toUri = function(activityObjectType)
{
    var name = ActivityObjectType.toName(activityObjectType);
    var path = "";
    switch (ActivityObjectType)
    {
        case ActivityObjectType.BlogEntry:
        {
            path = "blog-entry";
        }
        case ActivityObjectType.MakeFriend:
        {
            path = "make-friend";
        }
        case ActivityObjectType.PhotoAlbum:
        {
            path = "photo-album";
        }
        case ActivityObjectType.TvEpisode:
        {
            path = "tv-episode";
        }
        default:
        {
            if (name)
            {
                path = name.toLowerCase();
            }
        }
    }

    if (path)
    {
        return "http://activitystrea.ms/schema/1.0/" + path;
    }
    else
    {
        return "";
    }
}

/**
 * @class
 * An ActivityObject model that is used for storing the data related to an ActivityObject
 *
 * @param {ActivityObjectType} type the ActivityObjectType of this ActivityObjectModel
 * @param {String} title the title of this ActivityObjectModel
 * @param {String} [link] an optional URI for this ActivityObjectModel
 * @param {Object} [metaData] metaData for this ActivityObjectModel as required by the specification
 */
function ActivityObjectModel(type, title, link, metaData)
{
    /**
     * The autogenerated id of the activity object
     */
    this.id = null;
    // Note: source is excluded for now
    /**
     * The {@link #ActivityObjectType} of this ActivityObjectModel
     */
    this.type = type;
    /**
     * The title of this ActivityObjectModel. This will also be the <i>title</i> child element of the <i>atom</i> element
     *
     */
    this.title = title;
    /**
     * The link of the ActivityObject. This will also be the <i>link</i> child element of the <i>atom</i> element
     *
     */
    this.link = link;
    /**
     * The metadata for the given object
     *
     */
    this.metaData = metaData;
}

// TODO: add detail and activity stream objects like subject, verb and object

/**
 * @class
 * <p>An ActivityModel represents an activity entry in the stream. This correspond to an atom entry
 * element in the feed with extra activity elements.</p>
 *
 * @param {String} title the title of the activity
 * @param {ActivityVerbType|ActivityVerbType[]} [verb="ActivityVerbType.Post"] an {@link #ActivityVerbType} or an array of {@link #ActivityVerbType}
 * @param {ActivityObjectModel|ActivityObjectModel[]} object an {@link ActivityObjectModel} or an array of {@link ActivityObjectModel}
 * @param {String} string the content of the activity
 */
function ActivityModel(title, verb, object, content)
{
    /** the title */
    this.title = title;
    /*this.summary = data["summary"];
    this.detail = data["detail"];
    */
    /** an {@link #ActivityVerbType} or a list of {@link #ActivityVerbType}s */
    this.verb = verb ? verb : ActivityVerbType.Post; // default to POST according to spec
    /** an {@link ActivityObjectModel} or an array of {@link ActivityObjectModel}s*/
    this.object = object;
    /** the content of this ActivityModel */
    this.content = content;
    /*this.actor = data["actor"];
    this.target = data["target"];
    */
    // TODO: add actor and target

    /** autogenerated internal id for this ActivityModel */
    this.id = null;
}

/**
 * @class
 *
 * The main interface for this library. Contains methods for adding activities, generating the Atom activity feed and helpers
 */
function ActivityStream()
{
    if (ActivityStream.instance) {
        return ActivityStream.instance;
    }
    else
    {
        ActivityStream.instance = this;
    }

    var _prefKey = "_activity_stream";
    var _activityItems = [];
    var _maxItems = 20;
    var _idCounter = 0;
    var webserver = opera.io.webserver;
    var self = this;

    /**
     * @private
     */
    function onPublishActivity(evt)
    {
        var request = evt.connection.request,
            response = evt.connection.response;

        var payLoad = request.getItem("payload");
        self.publish(payLoad);
        response.setStatusCode(200, "OK");
        response.close();
    }

    /**
     * @private
     */
    function onGetActivityFeed(evt)
    {
        var request = evt.connection.request,
            response = evt.connection.response;

        response.setResponseHeader("Content-Type", "application/atom+xml")
        response.write(self.getAtom());
        response.close();
    }

    /**
     * @private
     */
    function onDeleteAllActivities(evt)
    {
        var request = evt.connection.request,
            response = evt.connection.response;

        widget.setPreferenceForKey("", _prefKey);
        _activityItems = [];
        response.setStatusCode(200, "OK");
        response.write("Preferences deleted");
        response.close();
    }

    /**
     * @private
     */
    function onGetStub(evt)
    {
        var request = evt.connection.request,
            response = evt.connection.response;

        // TODO: load stub into client
        response.close();
    }

    /**
     * @private
     */
    function zp(n)
    {
        return ("00"+n).slice(-2);
    }

    // TODO: fix
    /**
     * @private
     */
    function getRfc3339Time(time)
    {
        if (! time)
        {
            time = new Date();
        }

        var tz = time.getTimezoneOffset() / 60;
        var m = (tz/60 % 1) ? ":00" : ":30";
        if (tz < 0)
        {
            tz = "+" + zp(-tz) + m;
        }
        else if (tz > 0)
        {
            tz = "-" + zp(tz) + m;
        }
        else
        {
            tz = "Z";
        }

        return time.getFullYear() + "-" + zp(time.getMonth()+1) + "-" + zp(time.getDate()) + "T" + zp(time.getHours()) + ":" + zp(time.getMinutes()) + ":" + zp(time.getSeconds()) + tz;
    }

    /**
     * @private
     */
    function init()
    {
        //widget.setPreferenceForKey("", _prefKey);
        var tmpData = widget.preferenceForKey(_prefKey);
        _idCounter = widget.preferenceForKey(_prefKey + "_counter");
        //opera.postError("load : " + tmpData);
        if (! _idCounter)
        {
            _idCounter = 0;
        }
        _activityItems = (tmpData) ? JSON.parse(tmpData) : [];
    }

    /**
     * @private
     */
    function save()
    {
        if (_activityItems.length > _maxItems)
        {
            _activityItems = _activityItems.slice(_activityItems.length - _maxItems - 1);
        }
        var tmpData = JSON.stringify(_activityItems);
        widget.setPreferenceForKey(tmpData, _prefKey);
        //opera.postError("save : " + tmpData);
        widget.setPreferenceForKey(_idCounter, _prefKey + "_counter");
    }

    /**
     * @private
     */
    function getFeedUri()
    {
        // fixme: not good enough
        return "http://" +  webserver.hostName + webserver.currentServicePath;
    }

    /**
     * @private
     */
    function getEntryURI(activityItem)
    {
        return "tag:" + webserver.hostName + ",2009:" + activityItem.created;
    }

    /**
     * @private
     */
    function escapeHtml(string) {
        if ( !string || !string.replace ) {return ''; }
        return string.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    }

    /**
     * Generic method for publishing an activity. Future plan is to introduce more fine grained methods for publishing activities.
     *
     * @param {String} title the title of a specific activity
     * @param {ActivityVerbType|ActivityVerbType[]} verb either an {@link #ActivityVerbType} or an array of {@link #ActivityVerbType}
     * @param {ActivityObjectModel|ActivityObjectModel[]} object either an {@link ActivityObjectModel} or an array of {@link ActivityObjectModel}
     * @param {String} content the content of the activity
     *
     * @member  ActivityStream
     */
    this.publish = function(title, verb, object, content)
    {
        var am = new ActivityModel(title, verb, object, content);
        // TODO: find a better way for ids
        am.id = _idCounter++;
        if (isArray(am.object))
        {
            for (var i = 0; i < am.object.length; i++)
            {
                am.object[i].id = _idCounter++;
            }
        }
        else if (am.object)
        {
            am.object.id = _idCounter++;
        }
        am.created = am.updated = getRfc3339Time(); // TODO: get time from service?
        _activityItems.push(am);
        save();
    }

    /**
     * Method for setting up listeners for Unite.
     *
     * @member  ActivityStream
     */
    this.listen = function()
    {
         if (webserver)
         {
            webserver.addEventListener('activity', onGetActivityFeed, false);
            webserver.addEventListener('activityDeleteAll', onDeleteAllActivities, false);
         }
    }

    /**
     * @private
     */
    var pushActivityObject = function(a, obj)
    {
        a.push('<activity:object>');
        a.push('<id>' + obj.id + '</id>');
        a.push('<activity:object-type>' + escapeHtml(ActivityObjectType.toUri(obj.type)) + '</activity:object-type>');

        if (obj.title)
        {
            a.push('<title>' + escapeHtml(obj.title) + '</title>');
        }

        if (obj.link)
        {
            a.push('<link rel="alternate" type="text/html" href="' + escapeHtml(obj.link) + '"/>');
        }

        if (obj.source)
        {
            a.push('<title>' + escapeHtml(obj.title) + '</title>');
        }
        // TODO: add metadata for this verb

        a.push('</activity:object>');
    }

    /**
     * Generates and returns the atom feed with elements for the activity extension
     *
     * @returns {String} A string with the feed in XML format
     * @member  ActivityStream
     */
    this.getAtom = function()
    {
        var updated = _activityItems[0] ? _activityItems[_activityItems.length-1].updated : "2009-01-01T00:00:00Z";
        var a = ['<?xml version="1.0" encoding="utf-8"?>',
                 '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/">',
                    '<title>' + escapeHtml(webserver.currentServiceName) + '</title>',
                    '<id>' + escapeHtml(getFeedUri()) + '</id>',
                    '<author><name>' + escapeHtml(webserver.userName) + '</name></author>',
                    '<updated>' + escapeHtml(updated)  + '</updated>'];

        for (var i = _activityItems.length - 1; i > -1  ;i--)
        {
            a.push('<entry>',
                       '<title>' + escapeHtml(_activityItems[i].title) + '</title>',
                       '<id>' + escapeHtml(getEntryURI(_activityItems[i])) + '</id>',
                       '<published>' + escapeHtml(_activityItems[i].created) + '</published>',
                       '<updated>' + escapeHtml(_activityItems[i].updated) + '</updated>');

            if (isArray(_activityItems[i]['verb']))
            {
                for (var j = 0; j < _activityItems[i]['verb'].length; j++)
                {
                    a.push('<activity:verb>' + escapeHtml(ActivityVerbType.toUri(_activityItems[i]['verb'][j])) + '</activity:verb>');
                }
            }
            else
            {
                a.push('<activity:verb>' + escapeHtml(ActivityVerbType.toUri(_activityItems[i]['verb'])) + '</activity:verb>');
            }

            if (isArray(_activityItems[i]['object']))
            {
                for (var j = 0; j < _activityItems[i]['object'].length; j++)
                {
                    pushActivityObject(a, _activityItems[i]['object'][j]);
                }
            }
            else if (_activityItems[i]['object'])
            {
                pushActivityObject(a, _activityItems[i]['object']);
            }


            // TODO:
            //   o  atom:entry elements that contain no child atom:content element
            // MUST contain at least one atom:link element with a rel attribute
            // value of "alternate".
            if (_activityItems[i]['content'])
            {
                a.push('<content type="html"><![CDATA[' + _activityItems[i]['content'] + ']]></content>');
            }
            else
            {
                a.push('<content type="html"><![CDATA[]]></content>');
            }

            a.push('</entry>');
        }
        a.push('</feed>');

        return a.join('\n');
    }

    init();
}
