declare module 'mwbot';

type bluebird<R> = import("bluebird") <R>;

/**
 * MWBot library
 *
 * @author Simon Heimler
 */
declare class MWBot {

    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    /**
     * Constructs a new MWBot instance
     * It is advised to create one bot instance for every API to use
     * A bot instance has its own state (e.g. tokens) that is 
    necessary for some operations
    *
    * @param {{}} [customOptions]        Custom options
    * @param {{}} [customRequestOptions] Custom request options
    */
    constructor(customOptions?: {}, customRequestOptions?: {})

    //////////////////////////////////////////
    // GETTER & SETTER                      //
    //////////////////////////////////////////

    /**
     * Get mwbot version number
     * Uses ES5 getter
     */
    get version(): any


    /**
     * Set and overwrite mwbot options
     *
     * @param {Object} customOptions
     */
    public setOptions(customOptions: object): void

    /**
     * Sets and overwrites the raw request options, used by the "request" library
     * See https://www.npmjs.com/package/request
     *
     * @param {{}} customRequestOptions
     */
    setGlobalRequestOptions(customRequestOptions: {}): void

    /**
     * Sets the API URL for MediaWiki requests
     * This can be uses instead of a login, if no actions are used that require one.
     *
     * @param {String}  apiUrl  API Url to MediaWiki, e.g. 'https://www.semantic-mediawiki.org/w/api.php'
     */
    setApiUrl(apiUrl: string): void

    //////////////////////////////////////////
    // CORE REQUESTS                        //
    //////////////////////////////////////////

    /**
     * Executes a promisified raw request
     * Uses the npm request library
     *
     * @param {object} requestOptions
     *
     * @returns {bluebird}
     */
    rawRequest(requestOptions: object): bluebird<any>

    /**
     *Executes a request with the ability to use custom parameters and custom request options
     *
     * @param {object} params               Request Parameters
     * @param {object} customRequestOptions Custom request options
     *
     * @returns {bluebird}
     */
    request(params: object, customRequestOptions: object): bluebird<any>

    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

    /**
     * Executes a Login
     *
     * @see https://www.mediawiki.org/wiki/API:Login
     *
     * @param {object} [loginOptions]
     *
     * @returns {bluebird}
     */
    login(loginOptions?: object): bluebird<any>

    /**
     * Gets an edit token
     * This is currently only compatible with MW >= 1.24
     *
     * @returns {bluebird}
     */
    getEditToken(): bluebird<any>

    /**
     * Gets an edit token
     * Requires MW 1.27+
     *
     * @returns {bluebird}
     */
    getCreateaccountToken(): bluebird<any>

    /**
     * Combines Login  with GetEditToken
     *
     * @param {object} loginOptions
     *
     * @returns {bluebird}
     */
    loginGetEditToken(loginOptions: object): bluebird<any>

    /**
     * Combines Login  with GetCreateaccountToken
     *
     * @param {object} loginOptions
     *
     * @returns {bluebird}
     */
    loginGetCreateaccountToken(loginOptions: object): bluebird<any>

    //////////////////////////////////////////
    // CRUD OPERATIONS                      //
    //////////////////////////////////////////

    /**
     * Creates a new wiki pages. Does not edit existing ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [customRequestOptions]
     *
     * @returns {bluebird}
     */
    create(title: string, content: string, summary?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     * Wrapper for readWithProps
     *
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    read(title: string, redirect: boolean, customRequestOptions?: object): bluebird<any>

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     * Wrapper for readWithPropsFromID
     *
     * @param {number}  pageid    For multiple Pages use: PageA|PageB|PageC
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    readFromID(pageid: number, redirect: boolean, customRequestOptions?: object): bluebird<any>

    /**
     * Reads the content / and meta-data of one (or many) wikipages based on specific parameters
     *
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {string}  props    For multiple Props use: user|userid|content
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    readWithProps(title: string, props: string, redirect: boolean, customRequestOptions?: object): bluebird<any>

    /**
     * Reads the content / and meta-data of one (or many) wikipages based on specific parameters
     *
     * @param {number}  pageid    For multiple Pages use: PageA|PageB|PageC
     * @param {string}  props    For multiple Props use: user|userid|content
     * @param {boolean} redirect    If the page is a redirection, follow it or stay in the page
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    readWithPropsFromID(pageid: number, props: string, redirect: boolean, customRequestOptions?: object): bluebird<any>

    /**
     * Edits a new wiki pages. Creates a new page if it does not exist yet.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    edit(title: string, content: string, summary?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Updates existing wiki pages. Does not create new ones.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [customRequestOptions]
     *
     * @returns {bluebird}
     */
    update(title: string, content: string, summary?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Updates existing wiki pages. Does not create new ones.
     *
     * @param {number}  pageid
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    updateFromID(pageid: number, content: string, summary?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Deletes a new wiki page
     *
     * @param {string}  title
     * @param {string}  [reason]
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
     */
    delete(title: string, reason?: string, customRequestOptions?: object): bluebird<any>

    /**
    * Moves a wiki page
    *
    * @param {string}  oldName
    * @param {string}  newName
    * @param {string}  [reason]
    * @param {object}      [customRequestOptions]
    *
    * @returns {bluebird}
    */
    move(oldTitle: string, newTitle: string, reason?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Uploads a file
     *
     * @param {string}  [title] nullable, if null, it will be the same as the basename of pathToFile arg.
     * @param {string}  pathToFile
     * @param {string}  [comment]
     * @param {object}  [customParams]
     * @param {object}  [customRequestOptions]
     *
     * @returns {bluebird}
     */
    upload(title: string, pathToFile: string, comment?: string, customParams?: object, customRequestOptions?: object): bluebird<any>

    /**
     * Uploads a file and overwrites existing ones
     *
     * @param {string}  [title] nullable, if null, it will be the same as the basename of pathToFile arg.
     * @param {string}  pathToFile
     * @param {string}  [comment]
     * @param {object}  [customParams]
     * @param {object}  [customRequestOptions]
     *
     * @returns {bluebird}
     */
    uploadOverwrite(title: string, pathToFile: string, comment?: string, customParams?: object, customRequestOptions?: object): bluebird<any>


    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    /**
     * Combines all standard CRUD operations into one concurrent batch operation
     * The batch request will also print log messages about the current job status
     * It includes some more detailed error handling
     *
     * If the concurrency is set to 1, it ensures a sequential order
     * by switching from Promise.map to Promise.mapSeries
     *
     * @param {object|array}   jobs
     * @param {string}  [summary]
     * @param {number}  [concurrency]
     * @param {object}  [customRequestOptions]
     * 
     * @returns {bluebird}
     */
    batch(jobs: object | any[], summary?: string, concurrency?: number, customRequestOptions?: object): bluebird<any>

    /**
     * Execute an ASK Query
     *
     * @param {string} query
     * @param {string} [apiUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {bluebird}
     */
    askQuery(query: string, apiUrl?: string, customRequestOptions?: object): bluebird<any>

    /**
     * Executes a SPARQL Query
     * Defaults to use the wikidata endpoint
     *
     * @param {string} query
     * @param {string} [endpointUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {bluebird}
     */
    sparqlQuery(query: string, endpointUrl?: string, customRequestOptions?: object): bluebird<any>

    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
    //////////////////////////////////////////

    /**
     * Recursively merges two objects
     * Takes care that the two objects are not mutated
     *
     * @param {object} parent   Parent Object
     * @param {object} child    Child Object; overwrites parent properties
     *
     * @returns {object}        Merged Object
     */
    static merge(parent: object, child: object): object

    /**
     * Prints status information about a completed request
     *
     * @param status
     * @param currentCounter
     * @param totalCounter
     * @param operation
     * @param pageName
     * @param reason
     */
    static logStatus(status: any, currentCounter: any, totalCounter: any, operation: any, pageName: any, reason: any): void
}

