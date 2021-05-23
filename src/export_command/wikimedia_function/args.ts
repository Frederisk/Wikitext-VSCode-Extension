/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function alterNativeValues(...values: (string | undefined)[]): string {
    values = values.filter(item => { return item !== undefined; });
    return values.join("|");
}

export enum Action {
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
    login = "login",
    // ...
    parse = "parse",
    // ...
    query = "query",
    // ...
}

export enum Prop {
    reVisions = "revisions",
    text = "text",
    langLinks = "langlinks",
    categories = "categories",
    links = "links",
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

export enum RvProp {
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

export enum Format {
    jSON = "json",
    jSONFm = "jsonfm",
    none = "none",
    pHP = "php",
    pHPFm = "phpfm",
    rawFm = "rawfm",
    xML = "xml",
    xMLFm = "xmlfm"
}

export enum ContextModel {
    gadgetDefinition = "GadgetDefinition",
    jsonSchema = "JsonSchema",
    massMessageListContent = "MassMessageListContent",
    scribunto = "Scribunto",
    cSS = "css",
    flowBoard = "flow-board",
    javascript = "javascript",
    jSON = "json",
    sanitizedCSS = "sanitized-css",
    text = "text",
    unknown = "unknown",
    wikitext = "wikitext"
}

export enum TokenType {
    createAccount = "createaccount",
    cSRF = "csrf",
    deleteGlobalAccount = "deleteglobalaccount",
    login = "login",
    patrol = "patrol",
    rollback = "rollback",
    setGlobalAccountStatus = "setglobalaccountstatus",
    userRights = "userrights",
    watch = "watch"
}
