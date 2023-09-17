
type PageInfoField = 'pageTitle' | 'pageID' | 'revisionID' | 'contentModel' | 'contentFormat' | 'content';
export type PageInfo = Record<PageInfoField, string | undefined>;

export function getContentInfo(rawContent: string): PageInfo {
    function getInfoValue(infoBlock: string | undefined, fieldName: PageInfoField): string | undefined {
        if (infoBlock === undefined) {
            return undefined;
        }
        return infoBlock.match(new RegExp(
            `(?<=${fieldName}\\s*=\\s*#).*?(?=#)`
            //     fieldName     =    #(value)#
            , 'i'))?.[0];
    }

    const infoBlock: string | undefined = rawContent.match(
        /(?<=<%--\s*\[PAGE_INFO\])[\s\S]*?(?=\[END_PAGE_INFO\]\s*--%>)/
        //   <%--    [PAGE_INFO]  (any thing) [END_PAGE_INFO]    --%>
    )?.[0];
    const content: string = rawContent.replace(
        /\s*(?:\/\*|--\[=\[)?\s*<%--\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*--%>\s*(?:\*\/|--\]=\])?\s*/
        //      /*  --[=[       <%--    [PAGE_INFO](any thing)[END_PAGE_INFO]   --%>       */  --]=]
        , '');

    return {
        pageTitle: getInfoValue(infoBlock, 'pageTitle'),
        pageID: getInfoValue(infoBlock, 'pageID'),
        revisionID: getInfoValue(infoBlock, 'revisionID'),
        contentModel: getInfoValue(infoBlock, 'contentModel'),
        contentFormat: getInfoValue(infoBlock, 'contentFormat'),
        content: content
    };
}

export function generateDocumentText(pageInfo: PageInfo): string {
    function getCommentBrackets(modelName: string | undefined): [string, string] {
        function modelNameToLanguage(modelName: string | undefined): string {
            switch (modelName) {
                case undefined:
                case 'wikitext':
                    return 'wikitext';
                case 'flow-board':
                    return 'jsonc';
                case 'sanitized-css':
                    return 'css';
                case 'Scribunto':
                    return 'lua';
                default:
                    return modelName;
            }
        }

        const lang: string = modelNameToLanguage(modelName);
        const commentList: Record<string, [string, string] | undefined> = {
            wikitext: ['', ''],
            jsonc: ['/*', '*/'],
            lua: ['--[=[', '--]=]'],
            javascript: ['/*', '*/'],
            css: ['/*', '*/'],
            php: ['/*', '*/'],
            // 'flow-board': ['/*', '*/'],
            // 'sanitized-css': ['/*', '*/'],
            // 'Scribunto' : ['--[=[', '--]=]'],
        };
        const brackets: [string, string] | undefined = commentList[lang];
        if (brackets === undefined) {
            throw new Error(`Unsupported content model: ${lang}. Please report this issue to the author of this extension.`);
        }
        return brackets;
    }

    ////////////////////////////////////
    const info: Record<string, string | undefined> = {
        comment: "Please do not remove this struct. It's record contains some important information of edit. This struct will be removed automatically after you push edits.",
        ...pageInfo
    };
    const infoLine: string = Object.keys(info).map(
        (key: string): string => {
            const value: string = info[key] ?? '';
            return `    ${key} = #${value}#`;
        }
    ).join('\r');

    const textHead: string = getCommentBrackets(pageInfo.contentModel).join(
        `<%-- [PAGE_INFO]
${infoLine}
[END_PAGE_INFO] --%>`
    );

    const text: string = textHead + '\r\r' + pageInfo.content;

    return text;
}
