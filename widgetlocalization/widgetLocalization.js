function WidgetLocalization()
{
    var self = this;

    this.files = [];

    /**
     *  Derive the user agent's locale using the algorithm in
     *  http://www.w3.org/TR/widgets/#step-5--derive-the-user-agents-locale
     *
     *  @param {String} acceptLang A string with language codes following the
     *      Accept-Language format
     *  @returns {Array} An array with language codes
     */
    this.deriveLocale = function(acceptLang)
    {
        // The comments in this function corresponds to the steps in the algorithm
        // (more or less)

        var unprocessedLocales = acceptLang ? acceptLang.split(",") : [];
        var locales = [];

        // TODO: look at q values

        for (var i = 0, range; range = unprocessedLocales[i]; i++)
        {
        // 1
            range = normalizeRange(range);

        // 2.A and 2.B not implemented

        // 2.C
            while (true)
            {
        // 2.C.1
                locales.push(range);
        // 2.C.3
                if (range.indexOf("-") == -1) { break };
        // 2.C.2
                range = range.slice(0, range.lastIndexOf("-"));
            }
        }

        // 2.D
        locales.push("*");

        return locales;
    }

    /**
     *  Get a list of files used for localization, based on the Accept-Language
     *
     *  @param {Array} langcodes An array with languages codes
     *  @param {Array} files An array with file names to be searched for
     *  @returns {Array} An array consisting of arrays with two elements
     *      in the form [<langcode>, <filename>]
     */
    this.findLocaleFiles = function(acceptLang, files)
    {
        // XXX: Should the files argument not be needed, just grab all files?
        var langcodes = this.deriveLocale(acceptLang);
        var locales = opera.io.filesystem.mountSystemDirectory("application").resolve("locales");
        locales.refresh();

        if (files.constructor != Array) files = [files];

        if (!locales || locales.length == 0) { return }; // Nothing to be included

        // TODO: Normalize file name array to avoid overwriting already existing file
        // TODO: Remove duplicate lang codes
        // TODO: handle lowercase dir names, i.e. code en-US should match dir en-us
        langcodes.forEach(function(langcode) {
            var langcodeDir = locales.resolve((langcode != "*") ? langcode : "..");

            if (!langcodeDir.exists) { return };

            files.forEach(function(filename) {
                if (langcodeDir.resolve(filename).exists)
                {
                    self.files[filename] = "locales/" + langcode + "/" + filename;
                    // We don't have to search for this file name anymore
                    files.splice(files.indexOf(filename), 1);
                }
                else
                {
                    //self.files[filename] = filename;
                }
            });
        });
    }

    /**
     *  Normalizes a Language-Tag, i.e. removes the q value and
     *  converts it to lowercase.
     *
     *  @param {String} range A Language-Tag that may contain a q values
     *  @returns {String} A normalized Language-Tag
     */
    function normalizeRange(range)
    {
        return range.replace(/\s*;.*\s*/, "").toLowerCase();
    }
}
