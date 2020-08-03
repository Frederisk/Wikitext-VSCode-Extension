/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export enum action {
    // abuseFilterCheckMatch = "abusefiltercheckmatch",
    // abuseFilterCheckSyntax = "abusefilterchecksyntax",
    // abuseFilterEvalExpression = "abusefilterevalexpression",
    // abuseFilterUnblockAutoPromote = "abusefilterunblockautopromote",
    // abuseLogPrivateDetails = "abuselogprivatedetails",
    // antiSpoof = "antispoof",
    // block = "block",
    // centralAuthToken = "centralauthtoken",
    // centralNoticeCdnCacheUpdateBanner = "centralnoticecdncacheupdatebanner",
    // centralNoticeChoiceData = "centralnoticechoicedata",
    // ...
    parse = "parse",
    // ...
    query = "query",
    // ...
}

export enum prop { }

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

// 'zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&titles=Main_Page'
