/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function alterNativeValues(...values: (string | undefined)[]): string {
    values = values.filter(item => {return item !== undefined;});
    return values.join("|");
}

export enum action {
    abuseFilterCheckMatch = "abusefiltercheckmatch",
    abuseFilterCheckSyntax = "abusefilterchecksyntax",
    abuseFilterEvalExpression = "abusefilterevalexpression",
    abuseFilterUnblockAutoPromote = "abusefilterunblockautopromote",
    abuseLogPrivateDetails = "abuselogprivatedetails",
    antiSpoof = "antispoof",
    block = "block",
    centralAuthToken = "centralauthtoken",
    centralNoticeCdnCacheUpdateBanner = "centralnoticecdncacheupdatebanner",
    centralNoticeChoiceData = "centralnoticechoicedata",
    // ...
    parse = "parse",
    // ...
    query = "query",
    // ...
}

export enum prop {
    reVisions = "revisions",
    text = "text",
    langLinks = "langlinks",
    categories = "categories",
    links ="links",
    templates = "templates",
    images = "images",
    externalLinks = "externallinks",
    sections = "sections",
    revid = "revid",
    displayTitle = "displaytitle",
    iwLinks = "iwlinks",
    properties = "properties",
    parseWarnings = "parsewarnings",
    categoriesHTML = "categorieshtml",
    headHTML = "headhtml",
    modules = "modules",
    jSConfigVars = "jsconfigvars",
    encodedJSConfigVars = "encodedjsconfigvars",
    indicators = "indicators",
    wikitext = "wikitext",
    limitReportData = "limitreportdata",
    limitReportHTML = "limitreporthtml",
    parsetree = "parsetree"
}

export enum rvprop {
    ids = "ids",
    flags = "flags",
    timeStamp = "timestamp",
    user = "user",
    userId = "userid",
    size = "size",
    slotSize = "slotsize",
    sha1 = "sha1",
    slotSha1 = "slotsha1",
    contentModel = "contentmodel",
    comment = "comment",
    parsedComment = "parsedcomment",
    content = "content",
    tags = "tags",
    roles = "roles",
    oresscores = "oresscores"
}

export enum format {
    json = "json",
    jsonFm = "jsonfm",
    none = "none",
    php = "php",
    phpFm = "phpfm",
    rawFm = "rawfm",
    xml = "xml",
    xmlFm = "xmlfm"
}

export enum contextModel {
    GadgetDefinition = "GadgetDefinition",
    JsonSchema = "JsonSchema",
    MassMessageListContent = "MassMessageListContent",
    Scribunto = "Scribunto",
    CSS = "css",
    FlowBoard = "flow-board",
    Javascript = "javascript",
    JSON = "json",
    SanitizedCSS = "sanitized-css",
    Text = "text",
    Unknown = "unknown",
    Wikitext = "wikitext"
}


// 'zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&titles=Main_Page'
